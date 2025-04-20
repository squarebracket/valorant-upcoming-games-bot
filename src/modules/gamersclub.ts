import { League } from "../lib/leagues.ts";
import { BestOfStrategy, Match, MatchState } from "../lib/matches.ts";
import { StreamMapperFunction, TricodeMapper, doRequest } from "../lib/utils.ts";

type GamersClubTeam = {
  id: number;
  name: string;
  tag: string;
  bye?: boolean;
}

type GamersClubMatch = {
  id: number;
  teamA?: GamersClubTeam;
  teamB?: GamersClubTeam;
  finished: boolean;
  teamAScore: number;
  teamBScore: number;
  status?: 'COMING_SOON' | 'ONGOING' | 'FINISHED' | 'MAP_VETO';
  startDate: string;
  winnerId: number | null;
  matchFormat?: string;
}

type GamersClubPhase = {
  phase: number;
  matches: GamersClubMatch[];
}

type GamersClubBrackets = {
  lowerBracket: GamersClubPhase[];
  mainBracket: GamersClubPhase[];
};

const matchFormatMapper: {[key: number]: string} = {};

async function getGamersClubBracketMatches(
  tournament: number,
  league: League,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction,
) {
  const url = new URL(`https://api.gamersclub.gg/v1/tournaments/${tournament}/bracket/matches`);
  const brackets: GamersClubBrackets = (await doRequest(url)).data.brackets;
  const matches: Match[] = [];
  const fn = (phase: GamersClubPhase) => {
    phase.matches.forEach(match => {
      if (!match || !match.startDate) {
        return;
      }
      if (match.matchFormat) {
        matchFormatMapper[match.id] = match.matchFormat;
      }
      let state: MatchState;
      if (match.finished || new Date() > new Date(match.startDate)) {
        state = 'completed';
      } else {
        state = 'upcoming'
      }
      matches.push(parseGamersClubMatch(match, league, state, tricodeMapper, streamMapperFn));
    });
  };
  brackets.lowerBracket.forEach(fn);
  brackets.mainBracket.forEach(fn);
  return matches;
}

function parseGamersClubMatch(
  match: GamersClubMatch,
  league: League,
  state: MatchState,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction
) {
  const newMatch: Match = {
    league: league,
    startTime: new Date(match.startDate),
    state: state,
  };

  if (match.teamA) {
    newMatch.teamA = {
      name: match.teamA.name,
      code: match.teamA.tag || tricodeMapper[match.teamA.name] || match.teamA.name,
    };
    newMatch.teamA.result = {
      mapWins: match.teamAScore,
    };
  }

  if (match.teamB) {
    newMatch.teamB = {
      name: match.teamB.name,
      code: match.teamB.tag || tricodeMapper[match.teamB.name] || match.teamB.name,
    };
    newMatch.teamB.result = {
      mapWins: match.teamBScore,
    };
  }
  const matchFormat = match.matchFormat || matchFormatMapper[match.id];
  if (matchFormat) {
    const count = matchFormat.match(/BO(\d)/)![1];
    newMatch.strategy = {
      type: 'bestOf',
      count: parseInt(count),
    };
  }
  if (state === 'live' && streamMapperFn !== undefined) {
    // match is live
    const stream = streamMapperFn(newMatch.teamA, newMatch.teamB);
    if (stream) {
      newMatch.stream = new URL(stream);
    }
  }
  return newMatch;
}


async function getGamersClubImpl(
  url: URL,
  league: League,
  state: MatchState,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction
) {
  const retMatches: Match[] = [];
  const matches: GamersClubMatch[] = (await doRequest(url)).data.results;
  matches.forEach((match) => {
    const newMatch = parseGamersClubMatch(match, league, state, tricodeMapper, streamMapperFn);
    retMatches.push(newMatch);
  });
  return retMatches;
}

export async function getGamersClub(
  tournament: number,
  league: League,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction
): Promise<Match[]> {
  // const upUrl = new URL(`https://api.gamersclub.gg/v1/tournaments/${tournament}/matches/paginated?status=COMING_SOON&page=1&limit=50`);
  //const upcoming = await getGamersClubImpl(upUrl, league, false, tricodeMapper, streamMapperFn);
  const liveUrl = new URL(`https://api.gamersclub.gg/v1/tournaments/${tournament}/matches/paginated?status=ONGOING&page=1&limit=50`);
  const upcoming = await getGamersClubBracketMatches(tournament, league, tricodeMapper, streamMapperFn);
  const live = await getGamersClubImpl(liveUrl, league, 'live', tricodeMapper, streamMapperFn);
  const mapVetoUrl = new URL(`https://api.gamersclub.gg/v1/tournaments/${tournament}/matches/paginated?status=MAP_VETO&page=1&limit=50`);
  const mapVeto = await getGamersClubImpl(mapVetoUrl, league, 'live', tricodeMapper, streamMapperFn);
  const matches = live.concat(mapVeto).concat(upcoming);
  if (!matches.length) {
    const tourneyInfo = (await doRequest(new URL(`https://api.gamersclub.gg/v1/tournaments/${tournament}/about`)));
    const startTime = new Date(tourneyInfo.data.tournament.startDate);
    if (startTime > new Date()) {
      const placeholder: Match = {
        league: league,
        startTime: startTime,
        state: 'upcoming',
      };
      if (tourneyInfo.data.tournament.metadata.defaultMatchData.matchFormat) {
        const count = tourneyInfo.data.tournament.metadata.defaultMatchData.matchFormat.match(/BO(\d)/)[1];
        placeholder.strategy = {
          type: 'bestOf',
          count: parseInt(count),
        };
      }
      matches.push(placeholder);
    }
  }
  return matches;
}
