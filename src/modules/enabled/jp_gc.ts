import { getLeagueByName } from "../../lib/leagues.ts";
import { Match, Team } from "../../lib/matches.ts";
import { getMatchesFromScraped } from "../vlr_scraper.ts";
import { streamMapperLookupFunction } from "../../lib/utils.ts";

const tricodeMapper = {
};

const streamMapper = {
};

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(streamMapper, teamA, teamB);
}

export async function getMatches(): Promise<Match[]> {
  try {
    const league = await getLeagueByName('Game Changers JPN');
    if (league === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
      return [];
    }
    return (await getMatchesFromScraped(league, 2016, tricodeMapper, streamMapperFn));
  } catch {
    return [];
  }
}