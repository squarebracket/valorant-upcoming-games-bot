import { League } from "../lib/leagues.ts";
import { Match } from "../lib/matches.ts";
import { StreamMapperFunction, TricodeMapper, doRequest } from "../lib/utils.ts";

type GamersClubTeam = {
  id: number;
  name: string;
  tag: string;
}

type GamersClubMatch = {
  id: number;
  teamA?: GamersClubTeam;
  teamB?: GamersClubTeam;
  finished: boolean;
  teamAScore: number;
  teamBScore: number;
  status: 'COMING_SOON' | 'ONGOING';
  startDate: string;
  winnerId: number | null; 
}

async function getGamersClubImpl(
  url: URL,
  league: League,
  live: boolean,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction
) {
  const retMatches: Match[] = [];
  const matches: GamersClubMatch[] = (await doRequest(url)).data.results;
  //const data = JSON.parse(fs.readFileSync('brlive.json', 'utf8')).data.results;
  //console.log(data);
  matches.forEach((match) => {
    const newMatch: Match = {
      league: league,
      startTime: new Date(match.startDate),
      state: live ? 'live' : 'upcoming',
    };
    
    if (match.teamA) {
      newMatch.teamA = {
        name: match.teamA.name,
        code: match.teamA.tag || tricodeMapper[match.teamA.name],
      };
      newMatch.teamA.result = {
        mapWins: match.teamAScore,
      };
    }

    if (match.teamB) {
      newMatch.teamB = {
        name: match.teamB.name,
        code: match.teamB.tag || tricodeMapper[match.teamB.name],
      };
      newMatch.teamB.result = {
        mapWins: match.teamBScore,
      };
    }

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
  const liveUrl = new URL(`https://api.gamersclub.gg/v1/tournaments/${tournament}/matches/paginated?status=ONGOING&page=1&limit=50`);
  const upUrl = new URL(`https://api.gamersclub.gg/v1/tournaments/${tournament}/matches/paginated?status=COMING_SOON&page=1&limit=50`);
  const live = await getGamersClubImpl(liveUrl, league, true, tricodeMapper, streamMapperFn);
  const upcoming = await getGamersClubImpl(upUrl, league, false, tricodeMapper, streamMapperFn);
  return live.concat(upcoming);
}