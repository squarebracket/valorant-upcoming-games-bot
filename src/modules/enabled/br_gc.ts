import { getLeagueByName } from "../../lib/leagues.ts";
import { getGamersClub } from "../gamersclub.ts";

export async function getMatches() {
  const league = await getLeagueByName('Game Changers BR');
  if (!league) {
    throw new Error('no league');
  }
  const qual1 = await getGamersClub(3092, league);
  const qual2 = await getGamersClub(3093, league);
  return qual1.concat(qual2);
}