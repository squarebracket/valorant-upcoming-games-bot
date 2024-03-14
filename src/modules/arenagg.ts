import { League } from "../lib/leagues.ts";
import { Match } from "../lib/matches.ts";
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
}

// TODO: calculate standings?

export async function getArenaGG(
  tournament: number,
  league: League,
  tricodeMapper: TricodeMapper,
  streamMapper: StreamMapperFunction
): Promise<Match[]> {
  const retMatches: Match[] = [];
  const matches: ArenaGGMatch[] = (await doRequest(new URL(`https://api.arenagg.com/v1/matches?competition=${tournament}&limit=256&orderBy=position&sort=ASC`)))
    .data.filter((match: ArenaGGMatch) => match.status !== 'finished' && match.status !== 'canceled' && match.status !== 'resolved');

  matches.forEach((match) => {
    if (new Date() > new Date(match.startDate * 1000 + match.resultPublishTime*60*1000)) {
      return;
    }
    const startTime = new Date(match.startDate * 1000);
    const newMatch: Match = {
      league: league,
      startTime: startTime,
      state: match.status === 'playing' ? 'live' : 'upcoming',
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
      };
    }
    
    const teamB = match.profiles.shift();
    if (teamB) {
      newMatch.teamB = {
        name: teamB.participant.name,
        code: teamB.participant.tag ?? tricodeMapper[teamB.participant.name] ?? teamB.participant.name,
      };
    }
    retMatches.push(newMatch);
  });
  
  return retMatches;
}