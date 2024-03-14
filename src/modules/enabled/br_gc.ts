import { TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";
import { getLeagueByName } from "../../lib/leagues.ts";
import { getGamersClub } from "../gamersclub.ts";
import { Team } from "../../lib/matches.ts";

const streamMapper = {
  'TL': 'https://twitch.tv/oldmanspacca',
};

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(streamMapper, teamA, teamB);
}

const tricodeMapper: TricodeMapper = {};

export async function getMatches() {
  const league = await getLeagueByName('Game Changers BR');
  if (!league) {
    throw new Error('no league');
  }
  const qual1 = await getGamersClub(3092, league, tricodeMapper, streamMapperFn);
  const qual2 = await getGamersClub(3093, league, tricodeMapper, streamMapperFn);
  return qual1.concat(qual2);
}