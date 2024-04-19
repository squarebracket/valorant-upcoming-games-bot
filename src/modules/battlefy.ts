import { League } from "../lib/leagues.ts";
import { Match } from "../lib/matches.ts";
import { StreamMapper, StreamMapperFunction, TricodeMapper, doRequest } from "../lib/utils.ts";

type BattlefyTeam = {
  _id: string;
  name: string;
}

type BattlefyTeamSlot = {
  seedNumber: number;
  winner: boolean;
  disqualified: boolean;
  teamID: string;
  score: number;
  team?: BattlefyTeam;
}

type BattlefyMatch = {
  _id: string;
  top: BattlefyTeamSlot;
  bottom: BattlefyTeamSlot;
  matchType: 'winner' | 'loser';
  matchNumber: number;
  roundNumber: number;
  isBye: boolean;
  doubleLoss: boolean;
  isComplete: boolean;
  completedAt: string;
}

type BattlefyBracketSeries = {
  round: number;
  roundType: 'championship' | 'consolation' | 'final';
  numGames: number;
}

type BattlefyStanding = {
  disqualified: boolean;
  gameLosses: number;
  gameWinPercentage: number | null;
  gameWins: number;
  losses: number;
  matchWinPercentage: number | null;
  opponentsMatchWinPercentage: number | null;
  opponentsOpponentsMatchWinPercentage: number | null;
  points: number;
  rrt1: number | null;
  rrt2: number | null;
  rrt3: number | null;
  rrt4: number | null;
  rrt5: number | null;
  rrt6: number | null;
  rrt7: number | null;
  t1: number | null;
  t2: number | null;
  t3: number | null;
  team: BattlefyTeam;
  ties: number | null;
  wins: number | null;
}

type BattlefyGroup = {
  matches: BattlefyMatch[];
  name: string;
  standings: BattlefyStanding[];
}

type BattlefyStage = {
  _id: string;
  name: string;
  // date string
  startTime: string;
  bracket: {
    type: 'elimination' | 'roundrobin';
    seriesStyle: 'bestOf';
    style: 'single' | 'double';
    teamsCount: number;
    hasThirdPlaceMatch: boolean;
    roundsCount: number;
    series: BattlefyBracketSeries;
  };
  hasStarted: boolean;
  teamIDs: string[];
  matches?: BattlefyMatch[];
  groups?: BattlefyGroup[];
}

type BattlefyStartTimeMapper = { [key: string]: string[] };

const builtinTimeMappers: BattlefyStartTimeMapper = {
  'gc-quals': [
    '2024-03-22T21:00:00.000Z',
    '2024-03-23T00:00:00.000Z',
    '2024-03-23T21:00:00.000Z',
    '2024-03-24T00:00:00.000Z',
    '2024-03-25T21:00:00.000Z',
    '2024-03-26T00:00:00.000Z',
    '2024-03-26T21:00:00.000Z',
    '2024-03-27T00:00:00.000Z',
  ]
};

type BuiltinTimeMappers = 'gc-quals';

// TODO: better types?
const startTimeMapper = (stage: BattlefyStage, match: BattlefyMatch, startTimeMapper: string[], roundOffset: number) => {
  const startDate = new Date(stage.startTime);
  const a = new Date(startTimeMapper[0]);
  // @ts-ignore
  const diff = startDate - a;
  let roundNum = match.roundNumber + roundOffset;
  if (stage.bracket.style === 'double' && match.matchType === 'loser') {
    roundNum++;
  }
  const b = new Date(startTimeMapper[roundNum - 1]);
  b.setMilliseconds(b.getMilliseconds() + diff);
  return b;
}

export async function getBattlefy(
  tournamentId: string,
  league: League,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction,
  battlefyStartTimeMapper?: BuiltinTimeMappers | string[]
): Promise<Match[]> {
  const matches: Match[] = [];
  const now = new Date();

  const url = new URL(`https://dtmwra1jsgyb0.cloudfront.net/tournaments/${tournamentId}?extend%5Bstages%5D%5Bgroups%5D%5Bmatches%5D%5Btop.team%5D=true&extend%5Bstages%5D%5Bgroups%5D%5Bmatches%5D%5Bbottom.team%5D=true&extend%5Bstages%5D%5Bmatches%5D%5Btop.team%5D=true&extend%5Bstages%5D%5Bmatches%5D%5Bbottom.team%5D=true&extend%5Bstages%5D%5Bgroups%5D%5Bstandings%5D%5Bteam%5D=true&extend%5Bstages%5D%5Bstandings%5D%5Bteam%5D=true`);
  let maxRoundNumThisStage = 0;
  let roundOffset = 0;
  const data = (await doRequest(url))[0];
  data.stages.forEach((stage: BattlefyStage) => {
    if (!stage.matches) {
      return;
    }
    // stage.matches.filter((match) => !match.isComplete && !match.isBye).forEach((match) => {
    let matchesTemp: BattlefyMatch[] = [];
    if (stage.bracket.type === 'roundrobin') {
      stage.groups.forEach(group => {
        matchesTemp = matchesTemp.concat(group.matches);
      })
    } else {
      matchesTemp = stage.matches;
    }
    roundOffset = roundOffset + maxRoundNumThisStage;
    matchesTemp.forEach((match) => {
      maxRoundNumThisStage = Math.max(maxRoundNumThisStage, match.roundNumber);
      if (match.isBye || match.isComplete) {
        return;
      }
      let startTime = new Date(stage.startTime);
      if (battlefyStartTimeMapper) {
        if (typeof battlefyStartTimeMapper === 'string') {
          battlefyStartTimeMapper = builtinTimeMappers[battlefyStartTimeMapper];
        }
        startTime = startTimeMapper(stage, match, battlefyStartTimeMapper, roundOffset);
      }
      const newMatch: Match = {
        league: league,
        startTime: startTime,
        state: now > startTime ? 'live' : 'upcoming',
      };

      if (match.top.team) {
        newMatch.teamA = {
          name: match.top.team.name,
          code: tricodeMapper[match.top.team.name] ?? match.top.team.name,
          result: {
            mapWins: match.top.score ?? 0,
          }
        };
      }

      if (match.bottom.team) {
        newMatch.teamB = {
          name: match.bottom.team.name,
          code: tricodeMapper[match.bottom.team.name] ?? match.bottom.team.name,
          result: {
            mapWins: match.bottom.score ?? 0,
          }
        };
      }

      if (newMatch.state === 'live') {
        // match is live
        if (streamMapperFn !== undefined) {
          const stream = streamMapperFn(newMatch.teamA, newMatch.teamB);
          if (stream) {
            newMatch.stream = new URL(stream);
          }
        }
      }

      matches.push(newMatch);
    });
  });
  console.log(matches);
  return matches;
}