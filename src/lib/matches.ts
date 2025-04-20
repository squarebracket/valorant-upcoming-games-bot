import { League, sortLeaguesFn } from "./leagues.ts";

type Result = {
  outcome?: 'win' | 'loss' | null | undefined;
  mapWins: number;
}

export type Team = {
  name: string;
  code: string;
  result?: Result;
  record?: {
    wins: number;
    losses: number;
  };
}

export type BestOfStrategy = {
  type: 'bestOf';
  count: number;
}

export type MatchState = 'live' | 'upcoming' | 'completed';

export type Match = {
  startTime: Date;
  league: League;
  state: MatchState;
  teamA?: Team;
  teamB?: Team;
  strategy?: BestOfStrategy;
  stream?: URL;
}

// export interface LiveMatch extends Match {
  // stream: URL;
// }

export interface MatchesByLeague {
  [key: string]: Match[];
}


export function sortMatchesByLeague(matches: Match[]) {
  return matches.sort((a, b) => sortLeaguesFn(a.league, b.league));
}