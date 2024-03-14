import { League, getLeagueByName, getLeagues } from "../../lib/leagues.ts";
import { Match, MatchState, Team } from "../../lib/matches.ts";
import { doRequest } from "../../lib/utils.ts";

type ValEsportsTeam = {
  name: string;
  code: string;
  result: {
    outcome: "win" | "loss" | "null";
    gameWins: number;
  };
  record: {
    wins: number;
    losses: number;
  };
}

type ValEsportsStream = {
  // twitch username, youtube channel id, etc
  parameter: string;
  // TODO: make this validate locale string?
  locale: string;
  provider: 'twitch' | 'youtube' | 'afreecatv';
}

type ValEsportsEvent = {
  startTime: string;
  state: string;
  type: "match";
  blockName: string;
  league: League;
  match?: {
    id: string;
    teams: ValEsportsTeam[]
    strategy?: {
      type: "bestOf";
      count: number;
    }
  }
  streams?: ValEsportsStream[];
}

export async function getLiveMatches(): Promise<Match[]> {
  const liveEventsData = await doRequest(new URL('https://esports-api.service.valorantesports.com/persisted/val/getLiveDetails?hl=en-US&sport=val'));
  return await processMatches(liveEventsData.data.schedule.events, 'live');
}


export async function getUpcomingMatches(): Promise<Match[]> {
  const leagueIds = (await getLeagues()).map(league => league.id).join(',');
  // const matches: ValEsportsEvent[] = (await doRequest(new URL(`https://esports-api.service.valorantesports.com/persisted/val/getSchedule?hl=en-US&eventState=unstarted&sport=val&leagueId=${leagueIds}`)))
    // .data.schedule.events.filter((event: ValEsportsEvent) => event.state === 'unstarted');
    // console.log(`https://esports-api.service.valorantesports.com/persisted/val/getEventList?hl=en-US&eventState=unstarted&sport=val&leagueId=${leagueIds}`);
  let matches: ValEsportsEvent[] = [];
  let pageToken: string = '';
  while (true) {
    const url = new URL(`https://esports-api.service.valorantesports.com/persisted/val/getSchedule?hl=en-US&eventState=unstarted&sport=val&leagueId=${leagueIds}`);
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }
    // console.log(url);
    const result = (await doRequest(url));
    matches = matches.concat(result.data.schedule.events.filter((event: ValEsportsEvent) => event.state === 'unstarted'));
    if (result.data.schedule.pages.newer === null) {
      break;
    }
    pageToken = result.data.schedule.pages.newer;
    await new Promise<void>((resolve, reject) => setTimeout(() => resolve(), 100));
  }
  return await processMatches(matches, 'upcoming');
}

export async function getMatches(): Promise<Match[]> {
  return (await getLiveMatches()).concat(await getUpcomingMatches());
}

async function processMatches(matches: ValEsportsEvent[], type: MatchState): Promise<Match[]> {
  const retMatches: Match[] = [];
  matches.forEach(async (event: ValEsportsEvent) => {
    const league = (await getLeagueByName(event.league.name));
    if (league === undefined) {
      console.error(`unable to get league with name ${event.league.name}`);
      throw new Error(`can't get league`);
    }
    const match: Match = {
      startTime: new Date(event.startTime),
      league: league,
      state: type,
      strategy: event.match?.strategy,
    }
    try {
      if (event.match && event.match.teams[0].code !== 'TBD') {
        const teamA: Team = {
          name: event.match.teams[0].name,
          code: event.match.teams[0].code,
          record: event.match.teams[0].record,
        };
        if (event.match.teams[0].result) {
          teamA.result = {
            outcome: event.match.teams[0].result.outcome,
            mapWins: event.match.teams[0].result.gameWins,
          };
        }
        match.teamA = teamA;
      }

      if (event.match && event.match?.teams[1].code !== 'TBD') {
        const teamB: Team = {
          name: event.match.teams[1].name,
          code: event.match.teams[1].code,
          record: event.match.teams[1].record,
        };
        if (event.match.teams[1].result) {
          teamB.result = {
            outcome: event.match.teams[1].result.outcome,
            mapWins: event.match.teams[1].result.gameWins,
          };
        }
        match.teamB = teamB;
      }
    } catch (e) {
      console.error(event, match);
    }

    if (event.streams) {
      let stream: ValEsportsStream | undefined;
      const englishStreams = event.streams.filter(stream => /en.*/.test(stream.locale));
      if (englishStreams.length > 0) {
        if (englishStreams.find(stream => stream.provider === 'twitch')) {
          stream = englishStreams.find(stream => stream.provider === 'twitch');
        } else if (englishStreams.find(stream => stream.provider === 'youtube')) {
          stream = englishStreams.find(stream => stream.provider === 'youtube');
        } else if (englishStreams.find(stream => stream.provider === 'afreecatv')) {
          stream = englishStreams.find(stream => stream.provider === 'afreecatv');
        }
      } else if (englishStreams.length === 1) {
        stream = englishStreams[0];
      } else if (event.streams.length > 0) {
        stream = event.streams[0];
      }
      if (stream !== undefined) {
        if (stream.provider === 'twitch') {
          match.stream = new URL(`https://twitch.tv/${stream.parameter}`);
        } else if (stream.provider === 'youtube') {
          match.stream = new URL(`https://youtube.com/${stream.parameter}`);
        } else if (stream.provider === 'afreecatv') {
          match.stream = new URL(`https://afreecatv.com/${stream.parameter}`);
        }
      }
    }
    retMatches.push(match);
  });
  return retMatches;
}