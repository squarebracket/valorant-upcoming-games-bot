import { League, LeagueFilterFunction, getLeagues } from "./lib/leagues.ts";
import { Match } from "./lib/matches.ts";
import { getMatchesByLeague } from "./lib/utils.ts";

const MAX_MATCHES_PER_LEAGUE = 7;
const UPCOMING_TIMEFRAME_TARGET = 15;

type RenderFunction = (league: League, match: Match[], unseen: number, tierBreak: boolean) => string;

export function renderLiveMatch(match: Match): string {
  const stream = match.stream ? `<${match.stream}>` : '[Unknown]';
  if (!match.teamA && !match.teamB) {
    return `No team info was returned ¯\\_(ツ)_/¯ but it's live @ ${stream}`;
  }
  let leftSide = match.teamA ? match.teamA.code : 'TBD';
  if (match.teamA?.record) {
    leftSide += ` (${match.teamA.record.wins}-${match.teamA.record.losses})`;
  }
  let rightSide = match.teamB ? match.teamB.code : 'TBD';
  if (match.teamB?.record) {
    rightSide += ` (${match.teamB.record.wins}-${match.teamB.record.losses})`;
  }

  let message = `${leftSide} vs ${rightSide}`;
  if (match.teamA?.result && match.teamB?.result) {
    const strategy = match.strategy ? `BO${match.strategy.count} ` : '';
    message += ` (${strategy}Series Score: ${match.teamA.code} ${match.teamA.result.mapWins}-${match.teamB.result.mapWins} ${match.teamB.code})`;
  } else if (match.strategy) {
    message += ` (BO${match.strategy.count})`;
  }
  return `${message} @ ${stream}`;
}

export function renderUpcomingMatch(match: Match): string {
  let leftSide = match.teamA ? match.teamA.code : 'TBD';
  if (match.teamA?.record) {
    leftSide += ` (${match.teamA.record.wins}-${match.teamA.record.losses})`;
  }
  let rightSide = match.teamB ? match.teamB.code : 'TBD';
  if (match.teamB?.record) {
    rightSide += ` (${match.teamB.record.wins}-${match.teamB.record.losses})`;
  }

  const now = Date.now();
  let inTime = `<t:${match.startTime.valueOf() / 1000}:F>`;
  if (now > match.startTime.valueOf()) {
    inTime = '(should have started by now)';
  }
  const strategy = match.strategy ? ` (BO${match.strategy.count})` : '';
  return `${leftSide} vs ${rightSide} ${inTime}${strategy}`;
}

function renderMatches2(
  matches: Match[],
  renderAll: boolean,
  header: string,
  renderFn: RenderFunction
): string {
  if (matches.length === 0) {
    return '';
  } 
  let message = `${header}\n\n`;

  const matchesByLeagueTier = getMatchesByLeague(matches);
  const tiers = Object.keys(matchesByLeagueTier);
  let tierBreak = false;
  tiers.filter(tier => Object.keys(matchesByLeagueTier[tier as keyof typeof matchesByLeagueTier]).length).forEach((tier) => {
    const matchesByLeague = matchesByLeagueTier[tier as keyof typeof matchesByLeagueTier];
    const leagues = Object.keys(matchesByLeague);
    leagues.forEach((leagueName) => {
      let { league, matches } = matchesByLeague[leagueName];
      const emoji = league.emoji ? `${league.emoji}` : '';
      let unseen = 0;
      if (!renderAll && matches.length > MAX_MATCHES_PER_LEAGUE) {
        unseen = matches.length - MAX_MATCHES_PER_LEAGUE;
        matches = matches.slice(0, MAX_MATCHES_PER_LEAGUE - 1);
      }
      message += renderFn(league, matches, unseen, tierBreak);
      tierBreak = false;
    });
    tierBreak = true;
  })
  message += `\n`;

  return message;
}

const renderLiveMatches = (league: League, matches: Match[], unseen: number, tierBreak: boolean) => {
  let message = '';
  const emoji = league.emoji ? `${league.emoji}` : '';
  matches.forEach((match) => {
    message += `__${emoji}${league.name}__: ${renderLiveMatch(match)}\n`;
  });
  if (unseen) {
    message += `__${emoji}${league.name}__: ${unseen} more not shown, filter by ${league.name} to see all\n`;
  }
  return message;
}

const renderUpcomingMatches = (league: League, matches: Match[], unseen: number, tierBreak: boolean) => {
  let message = '';
  const emoji = league.emoji ? `${league.emoji}` : '';
  message += `${emoji}__${league.name}__\n`;
  matches.sort((a, b) => a.startTime < b.startTime ? -1 : 1).forEach((match) => {
    message += `${renderUpcomingMatch(match)}\n`;
  });
  if (unseen) {
    message += `*${unseen} more not shown, filter by ${league.name} to see all*\n`;
  }
  message += '\n';
  return message;
}

function findGoodTimeFrame(matches: Match[]) {
  const now = new Date();
  const stops = [168, 72, 48, 36, 24];
  for (let i = 0; i < stops.length; i++) {
    const hours = stops[i];
    const asdf = new Date(now.valueOf());
    asdf.setHours(now.getHours() + hours);
    const timeWindowMatches = matches.filter((match) => match.startTime < asdf);
    console.log(`matches in next ${hours}h: ${timeWindowMatches.length}`);
    if (timeWindowMatches.length < UPCOMING_TIMEFRAME_TARGET) {
      console.log(`less than ${UPCOMING_TIMEFRAME_TARGET}`);
      return {
        matches: timeWindowMatches,
        hours: hours,
      };
    }
  }
  console.log(`unable to find time window small enough for ${UPCOMING_TIMEFRAME_TARGET}`);
  const asdf = new Date(now.valueOf());
  asdf.setHours(now.getHours() + 24);
  return {
    matches: matches.filter((match) => match.startTime < asdf),
    hours: 24,
  };
}

export async function renderMatches(matches: Match[], filterFn: LeagueFilterFunction): Promise<string> {
  let renderAll = false;
  const filteredLeagues = (await getLeagues()).filter(filterFn);
  if (filteredLeagues.length === 1) {
    console.log('only 1 league, so render all');
    renderAll = true;
  }

  const leagueFiltered = matches.filter(match => filterFn(match.league));
  let timeWindowFiltered: Match[] = leagueFiltered;
  let hours = undefined;
  if (renderAll === false) {
    console.log('renderAll is false so time window filter');
    const ret = findGoodTimeFrame(leagueFiltered);
    timeWindowFiltered = ret.matches;
    hours = ret.hours;
  }
  const live: Match[] = timeWindowFiltered.filter(match => match.state === 'live')
    // sort matches with streams to the top in case we have more than MAX_MATCHES_PER_LEAGUE
    .sort((a, b) => a.stream ? -1 : (b.stream ? 1 : 0));
  const upcoming: Match[] = timeWindowFiltered.filter(match => match.state === 'upcoming');
  const filteredOut = matches.filter(match => !filterFn(match.league));

  const liveMessage = renderMatches2(live, renderAll, '**LIVE**', renderLiveMatches);
  const upcomingMessage = renderMatches2(
    upcoming,
    renderAll,
    hours ? `**UPCOMING (NEXT ${hours}H)**` : '**UPCOMING (ALL)**',
    renderUpcomingMatches
  );

  if (filteredOut.length > 0) {
    // message += `\n_Some matches were filtered out due to the league filter_`;
  }

  console.log(`${matches.length} total matches, ${leagueFiltered.length} after league filter, ${timeWindowFiltered.length} after time filter.`);

  return liveMessage + upcomingMessage;
}