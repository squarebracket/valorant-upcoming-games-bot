import { League } from "../lib/leagues.ts";
import { Match, MatchState } from "../lib/matches.ts";
import { StreamMapperFunction, TricodeMapper, doRequest } from "../lib/utils.ts";

type ArenaGGParticipant = {
  avatar: string;
  id: number;
  name: string;
  tag: string | null;
}

type ArenaGGProfile = {
  id: number;
  isWinner: boolean;
  participant: ArenaGGParticipant;
}

type ArenaGGMatch = {
  bestOf: number;
  id: number;
  profiles: ArenaGGProfile[];
  roundNumber: number;
  roundType: 'winner' | 'loser';
  startDate: number;
  status: 'finished' | 'canceled' | 'resolved' | 'scheduled' | 'playing';
  resultPublishTime: number;
  result: { [key: string]: number };
}

// TODO: calculate standings?

export async function getArenaGG(
  tournament: number,
  league: League,
  tricodeMapper: TricodeMapper = {},
  streamMapper: StreamMapperFunction
): Promise<Match[]> {
  const retMatches: Match[] = [];
  const matches: ArenaGGMatch[] = (await doRequest(new URL(`https://api.arenagg.com/v1/matches?competition=${tournament}&limit=256&orderBy=position&sort=ASC`)))
    .data.filter((match: ArenaGGMatch) => match.status !== 'canceled' && match.status !== 'resolved');

  const standings: { [key: string]: { w: number, l: number } } = {};
  matches.forEach((match) => {
    if (match.status === 'finished' && match.profiles.length === 2) {
      match.profiles.forEach((profile) => {
        if (!standings[profile.participant.name]) {
          standings[profile.participant.name] = { w: 0, l: 0 };
        }
        if (profile.isWinner) {
          standings[profile.participant.name].w++;
        } else {
          standings[profile.participant.name].l++;
        }
      })
    }
  })

  matches.forEach((match) => {
    const startTime = new Date(match.startDate * 1000);
    const matchState = match.status === 'playing' ? 'live' : (match.status === 'finished' ? 'completed' : 'upcoming');
    const newMatch: Match = {
      league: league,
      startTime: startTime,
      state: matchState,
      strategy: {
        type: "bestOf",
        count: match.bestOf,
      },
    };

    const teamA = match.profiles.shift();
    if (teamA) {
      newMatch.teamA = {
        name: teamA.participant.name,
        code: teamA.participant.tag ?? tricodeMapper[teamA.participant.name] ?? teamA.participant.name,
        result: {
          mapWins: match.result[teamA.id.toString()] ?? 0,
          outcome: teamA.isWinner === true ? 'win' : (match.status === 'finished' ? 'loss' : undefined),
        },
        record: {
          wins: standings[teamA.participant.name].w,
          losses: standings[teamA.participant.name].l,
        },
      };
    }

    const teamB = match.profiles.shift();
    if (teamB) {
      newMatch.teamB = {
        name: teamB.participant.name,
        code: teamB.participant.tag ?? tricodeMapper[teamB.participant.name] ?? teamB.participant.name,
        result: {
          mapWins: match.result[teamB.id.toString()] ?? 0,
          outcome: teamB.isWinner === true ? 'win' : (match.status === 'finished' ? 'loss' : undefined),
        },
        record: {
          wins: standings[teamB.participant.name].w,
          losses: standings[teamB.participant.name].l,
        },
      };
    }
    retMatches.push(newMatch);
  });

  return retMatches;
}