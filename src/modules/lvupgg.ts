import { League } from "../lib/leagues.ts";
import { Match } from "../lib/matches.ts";
import { doRequest } from "../lib/utils.ts";
import { bestOfTimeMapper } from "../lib/utils.ts";

type LvlUpGGStage = {
  stageId: string;
  title: string;
  status: 'END';
  schedule: {
    startDateTime: number;
    endDateTime: number;
  }
  matchRule: {
    bo: 0 | 1 | 3 | 5;
    groupIds: string[];
    matchRuleType: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION';
  }
}

type LvlUpGGTeamInfo = {
  team: {
    teamId: string;
    name: string;
  }
}

type LvlUpGGMatch = {
  id: string;
  matchTime: number | null;
  home: LvlUpGGTeamInfo | null;
  away: LvlUpGGTeamInfo | null;
  isEmptyHome: boolean;
  isEmptyAway: boolean;
  winByDefault: boolean;
  bo: 0 | 1 | 3 | 5;
  homePoint: number;
  awayPoint: number;
  isDisabled: boolean;
  round: number;
  prev: {
    left: string | null;
    right: string | null;
  };
}

type NameCodeMapper = { [key: string]: string };

export async function getLvlUpMatchesForTourney(tournament: string, league: League, mapper: NameCodeMapper) {
  const retMatches: Match[] = [];
  const matchFinishedMapper: {[key: string]: boolean} = {};
  const stageUrl = new URL(`https://api.lvup.gg/v2/arenas/${tournament}/stages`);
  const stages: LvlUpGGStage[] = (await doRequest(stageUrl)).body;
  for (const stage of stages) {
    const bracketType = stage.matchRule.matchRuleType.toLowerCase().replace('_', '-');
    for (const groupId of stage.matchRule.groupIds) {
      const matchesUrl = new URL(`https://api.lvup.gg/v2/arenas/${tournament}/stages/${stage.stageId}/${bracketType}/matches?groupId=${groupId}`);
      const roundMatches: {[key: string]: LvlUpGGMatch[]} = (await doRequest(matchesUrl)).body.round;
      const rounds = Object.keys(roundMatches);
      for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        const matches = roundMatches[round];
        matches.forEach((match) => {
          if (match.winByDefault || match.isDisabled) {
            return;
          }

          const matchStart = new Date(stage.schedule.startDateTime + ((match.round - 1) * bestOfTimeMapper[match.bo]));
          const mapsRequired = Math.round(match.bo / 2);
          const finished = match.awayPoint === mapsRequired || match.homePoint === mapsRequired;
          matchFinishedMapper[match.id] = finished;

          if (finished) {
            return;
          }

          let state: 'live' | 'upcoming' = 'upcoming';
          // @ts-ignore
          if ((match.prev.right || match.prev.left) && (matchFinishedMapper[match.prev.right] === false || matchFinishedMapper[match.prev.left] === false)) {
            state = 'upcoming';
          } else {
            if (matchStart < new Date()) {
              state = 'live';
            } else {
              state = 'upcoming';
            }
          }

          const newMatch: Match = {
            league: league,
            state: state,
            startTime: matchStart,
            strategy: {
              type: "bestOf",
              count: match.bo,
            },
          };
          
          if (match.home !== null) {
            newMatch.teamA = {
              result: {
                mapWins: match.homePoint,
              },
              name: match.home.team.name,
              code: mapper[match.home.team.name] ?? match.home.team.name,
            };
          }
          
          if (match.away !== null) {
            newMatch.teamB = {
              result: {
                mapWins: match.awayPoint,
              },
              name: match.away.team.name,
              code: mapper[match.away.team.name] ?? match.away.team.name,
            };
          }
          
          retMatches.push(newMatch);
        });
      }
    }
  }
  return retMatches;
}