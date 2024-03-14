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

type BattlefyStage = {
  _id: string;
  name: string;
  // date string
  startTime: string;
  bracket: {
    type: string;
    seriesStyle: 'bestOf';
    style: 'single' | 'double';
    teamsCount: number;
    hasThirdPlaceMatch: boolean;
    roundsCount: number;
    series: BattlefyBracketSeries;
  };
  hasStarted: boolean;
  teamIDs: string[];
  matches: BattlefyMatch[];
}

type BattlefyStartTimeMapper = { [key: string]: string[] };

export async function getBattlefy(
  url: URL,
  league: League,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction,
  battlefyStartTimeMapper?: BattlefyStartTimeMapper
): Promise<Match[]> {
  const matches: Match[] = [];
  const now = new Date();

  const data = (await doRequest(url))[0].stages.forEach((stage: BattlefyStage) => {
    if (!stage.matches) {
      return;
    }
    // stage.matches.filter((match) => !match.isComplete && !match.isBye).forEach((match) => {
    stage.matches.filter((match) => !match.isBye).forEach((match) => {
      if (/group/i.test(stage.name)) {
        return;
      }
      let startTime = new Date(stage.startTime);
      if (battlefyStartTimeMapper && battlefyStartTimeMapper[stage._id]) {
        const mapper = battlefyStartTimeMapper[stage._id];
        if (mapper[match.roundNumber - 1]) {
          startTime = new Date(mapper[match.roundNumber - 1]);
        }
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
        };
      }

      if (match.bottom.team) {
        newMatch.teamB = {
          name: match.bottom.team.name,
          code: tricodeMapper[match.bottom.team.name] ?? match.bottom.team.name,
        };
      }

      if (newMatch.state === 'live' && streamMapperFn !== undefined) {
        // match is live
        const stream = streamMapperFn(newMatch.teamA, newMatch.teamB);
        if (stream) {
          newMatch.stream = new URL(stream);
        }
      }

      matches.push(newMatch);
    });
  });
  console.log(matches);
  return matches;
}