import { getLiquipedia } from '../liquipedia.ts';
import { League, getLeagueByName } from "../../lib/leagues.ts";
import { TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";
import { Team } from "../../lib/matches.ts";
import { getQQ } from '../qq.ts';

const tricodeMapper: TricodeMapper = {};

const streamMapper = {};
const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(streamMapper, teamA, teamB);
}

export async function getMatches() {
  const league = await getLeagueByName('Game Changers China');
  if (!league) {
    throw new Error('no league');
  }
  // return await getLiquipedia('VCT 2024: Game Changers China', league, tricodeMapper, streamMapperFn);
  return await getQQ(1000022, league, () => `https://www.twitch.tv/valorantesports_cn`);
}