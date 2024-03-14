import { getLeagueByName } from "../../lib/leagues.ts";
import { Match, Team } from "../../lib/matches.ts";
import { streamMapperLookupFunction } from "../../lib/utils.ts";
import { getMatchesFromScraped } from "../vlr_scraper.ts";

const tricodeMapper = {
  'os piticos': 'osp',
  'Team Liquid Brazil': 'TLBR',
};

const streamMapper = {
  'TLBR': 'https://twitch.tv/TeamLiquidBR',
  'SAGAZ': 'https://twitch.tv/SAGAZ',
};

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(streamMapper, teamA, teamB);
}

export async function getMatches(): Promise<Match[]> {
  try {
    const league = await getLeagueByName('Challengers BR');
    if (league === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
      return [];
    }
    return (await getMatchesFromScraped(league, 'chal-br.json', tricodeMapper, streamMapperFn));
  } catch {
    return [];
  }
}