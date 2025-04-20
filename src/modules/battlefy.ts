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

type BattlefyCustomField = {
  name: string;
  public: boolean;
  _id: string;
}

type BattlefyTournament = {
  startTime: string;
  customFields: BattlefyCustomField[];
  name: string;
  requireScreenshotForScoreReporting: boolean;
  stages: BattlefyStage[];
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
  ],
  'gc-main': [
    '2025-02-11T22:00:00.000Z',
    '2025-02-12T00:00:00.000Z',
    '2025-02-12T22:00:00.000Z',
    '2025-02-13T00:00:00.000Z',
    '2025-02-13T22:00:00.000Z',
    '2025-02-14T00:00:00.000Z',
    '2025-02-14T22:00:00.000Z',
    '2025-02-15T22:00:00.000Z',
  ]
};

type BuiltinTimeMappers = 'gc-quals' | 'gc-main';

// TODO: better types?
const startTimeMapper = (stage: BattlefyStage, match: BattlefyMatch, startTimeMapper: string[]) => {
  const startDate = new Date(stage.startTime);
  const a = new Date(startTimeMapper[0]);
  // @ts-ignore
  const diff = startDate - a;
  let roundNum = match.roundNumber;
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
  const data: BattlefyTournament = (await doRequest(url))[0];

  if (league.name === 'Game Changers NA') {
    const playoffs = data.stages.filter(stage => /playoffs/i.test(stage.name));
    if (data.stages.length === 0) {
      // make a fake match placeholder for the tourney
      let startTime = new Date(data.startTime);
      const newMatch: Match = {
        league: league,
        startTime: startTime,
        state: "upcoming",
      }
      matches.push(newMatch);
    } else if (playoffs.length === 0) {
      // make a fake match placeholer for playoffs
      let startTime = new Date(data.stages[0].startTime);
      if (battlefyStartTimeMapper) {
        if (typeof battlefyStartTimeMapper === 'string') {
          battlefyStartTimeMapper = builtinTimeMappers[battlefyStartTimeMapper];
        }
        const a = new Date(battlefyStartTimeMapper[0]);
        // @ts-ignore
        const diff = startTime - a;
        const b = new Date(battlefyStartTimeMapper[3]);
        b.setMilliseconds(b.getMilliseconds() + diff);

        const newMatch: Match = {
          league: league,
          startTime: b,
          state: "upcoming",
        }
        matches.push(newMatch);
      }
    }
  }

  data.stages.forEach((stage: BattlefyStage) => {
    if (!stage.matches) {
      return;
    }
    // stage.matches.filter((match) => !match.isComplete && !match.isBye).forEach((match) => {
    let matchesTemp: BattlefyMatch[] = [];
    if (stage.bracket.type === 'roundrobin' && stage.groups !== undefined) {
      stage.groups.forEach(group => {
        group.matches.forEach((match) => {
          maxRoundNumThisStage = Math.max(maxRoundNumThisStage, match.roundNumber);
          match.roundNumber = roundOffset + match.roundNumber;
          matchesTemp.push(match);
        })
      })
      roundOffset = roundOffset + maxRoundNumThisStage;
      maxRoundNumThisStage = 0;
    } else {
      matchesTemp = stage.matches;
    }
    matchesTemp.forEach((match) => {
      if (match.isBye || match.isComplete) {
        return;
      }
      if (league.name === 'Game Changers NA') {
        // hacks for na gc quals
        if (stage.bracket.style === 'double' && match.roundNumber > 2) {
          return;
        }
        if (stage.bracket.style === 'double' && !/group/i.test(stage.name)) {
          match.roundNumber = match.roundNumber + 3;
          if (match.matchType === 'loser') {
            match.roundNumber = match.roundNumber + 1;
          }
        }
        if (stage.bracket.style === 'single') {
          match.roundNumber = match.roundNumber + 3;
        }

      }
      let startTime = new Date(stage.startTime);
      if (battlefyStartTimeMapper) {
        if (typeof battlefyStartTimeMapper === 'string') {
          battlefyStartTimeMapper = builtinTimeMappers[battlefyStartTimeMapper];
        }
        startTime = startTimeMapper(stage, match, battlefyStartTimeMapper);
      }
      const newMatch: Match = {
        league: league,
        startTime: startTime,
        state: now > startTime ? 'live' : 'upcoming',
      };

      if (match.top.team) {
        if (/BYE [A-Z]/.test(match.top.team.name)) {
          return;
        }
        newMatch.teamA = {
          name: match.top.team.name,
          code: tricodeMapper[match.top.team.name] ?? match.top.team.name,
          result: {
            mapWins: match.top.score ?? 0,
          }
        };
      }

      if (match.bottom.team) {
        if (/BYE [A-Z]/.test(match.bottom.team.name)) {
          return;
        }
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
  return matches;
}
