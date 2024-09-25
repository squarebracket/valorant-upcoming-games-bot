import { TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";
import { getLeagueByName } from "../../lib/leagues.ts";
import { getGamersClub } from "../gamersclub.ts";
import { Team } from "../../lib/matches.ts";

const streamMapper = {
  // 'Liquid': 'https://twitch.tv/tixinhadois',
  // 'MIBR': 'https://www.twitch.tv/naperx_',
  // 'furico': 'https://www.twitch.tv/leticiaxmotta',
  // 'CMJ': 'https://www.twitch.tv/bahgutierrez',
  // 'DDB': 'https://www.twitch.tv/wildchun',
  // 'RKT': 'https://www.twitch.tv/akakarota',
  // 'DMX': 'https://www.twitch.tv/naoshiitv',
  // 'LOUD': 'https://www.twitch.tv/naoshiitv',
  // 'TLV': 'https://www.twitch.tv/anaz1k',
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
  const qual1 = await getGamersClub(3126, league, tricodeMapper, streamMapperFn);
  const qual2 = await getGamersClub(3127, league, tricodeMapper, streamMapperFn);
  return qual1.concat(qual2);
}