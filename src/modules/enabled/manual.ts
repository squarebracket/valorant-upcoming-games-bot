import { readFileSync } from 'node:fs';

import { Match, MatchState, Team, BestOfStrategy } from "../../lib/matches.ts";
import { getLeagueByName } from '../../lib/leagues.ts';

type ManualMatch = {
  startTime: string;
  endTime: string;
  league: string;
  teamA?: Team;
  teamB?: Team;
  strategy?: BestOfStrategy;
  stream?: URL;
};

export async function getMatches(): Promise<Match[]> {
  const matches: Match[] = [];
  const file = 'manual.json';
  const json: ManualMatch[] = JSON.parse(readFileSync(file).toString());
  for (let i = 0; i < json.length; i++) {
    const match = json[i];
    const startTime = new Date(match.startTime);
    const endTime = new Date(match.endTime);
    if (endTime < new Date()) {
      continue;
    }

    const league = await getLeagueByName(match.league);
    if (!league) {
      continue;
    }

    const state: MatchState = (new Date() > startTime) ? 'live' : 'upcoming';
    const newMatch: Match = {
      startTime: startTime,
      league: league,
      state: state,
      strategy: match.strategy,
      stream: match.stream,
    }
    if (match.teamA) {
      newMatch.teamA = {
        name: match.teamA.name,
        code: match.teamA.code || match.teamA.name,
      };
    }
    if (match.teamB) {
      newMatch.teamB = {
        name: match.teamB.name,
        code: match.teamB.code || match.teamB.name,
      };
    }
    matches.push(newMatch);
  }
  return matches;
}