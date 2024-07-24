import { parse } from 'node-html-parser';

import { StreamMapperFunction, TricodeMapper, doRequest } from "../lib/utils.ts";
import { Match, MatchState, Team } from "../lib/matches.ts";
import { League } from '../lib/leagues.ts';

type ScrapedMatch = {
  startTime: Date;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
}

export async function getMatches(tourneyId: string) {
  const matches: ScrapedMatch[] = [];
  let page = 1;
  while (true) {
    console.log(`making request for page ${page}`);
    let url: URL = new URL(`https://play.toornament.com/en_US/tournaments/${tourneyId}/matches/schedule?page=${page}`);

    let html: string;

    try {
      html = await doRequest(url, false);
    } catch (e) {
      console.log('error making request');
      break;
    }
    const root = parse(html);

    const container = root.querySelector(`div[class="grid-flex vertical spaceless"]`);
    const divs = container.querySelectorAll(`div.size-content`);
    divs.forEach((div => {
      if (div.attributes['class'] === 'size-content align-stretch') {
        return;
      }
      if (div.querySelector('div.win')) {
        return;
      }
      const [team1, team2] = div.querySelectorAll('div.opponent');

      const teamA = team1.querySelector('div.name').text.trim();
      const scoreA = team1.querySelector('div.result') && parseInt(team1.querySelector('div.result').text.trim());
      const teamB = team2.querySelector('div.name').text.trim();
      const scoreB = team2.querySelector('div.result') && parseInt(team2.querySelector('div.result').text.trim());
      const startTime = new Date(div.querySelector('datetime-view').getAttribute('value'));
      const scores = div.querySelectorAll('div.record div.result');
      matches.push({
        startTime: startTime,
        teamA,
        teamB,
        scoreA,
        scoreB,
      });
    }));
    page = page + 1;
  }
  return matches;
}

export async function getMatchesFromToornament(
  league: League,
  tourneyId: string,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction,
): Promise<Match[]> {
  const matches: Match[] = [];
  const scrapedMatches = await getMatches(tourneyId);

  scrapedMatches.forEach((match) => {
    const state: MatchState = (new Date() > match.startTime) ? 'live' : 'upcoming';
    const newMatch: Match = {
      league: league,
      startTime: match.startTime,
      state: state,
    }

    if (match.teamA !== 'To be determined') {
      newMatch.teamA = {
        name: match.teamA,
        code: tricodeMapper[match.teamA] || match.teamA,
      };
      if (match.scoreA !== null) {
        newMatch.teamA.result = {
          mapWins: match.scoreA,
        };
      }
    }

    if (match.teamB !== 'To be determined') {
      newMatch.teamB = {
        name: match.teamB,
        code: tricodeMapper[match.teamB] || match.teamB,
      };
      if (match.scoreB !== null) {
        newMatch.teamB.result = {
          mapWins: match.scoreB,
        };
      }
    }

    if (state === 'live' && streamMapperFn !== undefined) {
      // match is live
      const stream = streamMapperFn(newMatch.teamA, newMatch.teamB);
      if (stream) {
        newMatch.stream = new URL(stream);
      }
    }

    matches.push(newMatch);
  })
  return matches;
}
