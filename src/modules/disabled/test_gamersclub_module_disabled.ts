import { getLeagueByName } from "../../lib/leagues.ts";
import { getGamersClub } from "../gamersclub.ts";

export async function getMatches() {
  const league = await getLeagueByName('Challengers BR');
  if (!league) {
    throw new Error('no league');
  }
  return (await getGamersClub(3086, league));
}