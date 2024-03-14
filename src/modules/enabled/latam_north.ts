import { getArenaGG } from "../arenagg.ts";
import { getLeagueByName } from "../../lib/leagues.ts";
import { Match } from "../../lib/matches.ts";
import { StreamMapper, TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";

const tricodeMapper: TricodeMapper = {
  'Ragnus Esports': 'RGS',
  'BARCELONA ESPORTS GC': 'BSC',
  'Akave Esports GC': 'AKV',
};
const streamMapper: StreamMapper = {
};

export async function getMatches(): Promise<Match[]> {
  const league = await getLeagueByName('Game Changers LATAM');
  if (!league) {
    throw new Error('unable to find latam gc league');
    return [];
  }
  return (await getArenaGG(164766, league, tricodeMapper, (a, b) => streamMapperLookupFunction(streamMapper, a, b)));
}