import { getLeagueByName } from "../../lib/leagues.ts";
import { Match, Team } from "../../lib/matches.ts";
import { streamMapperLookupFunction } from "../../lib/utils.ts";
import { getMatchesFromSpike } from "../spikegg_scraper.ts";

const tricodeMapper = {
};

const streamMapper = {
  'MAD Lions KOI': 'https://www.twitch.tv/SergioFFerra',
  'Karmine Corp Female': 'https://www.twitch.tv/helydia',
  'BLVKHVND': 'https://www.twitch.tv/blvkhvnd',
  'ZERANCE GC': 'https://www.twitch.tv/zerancepartout',
  'Gamax Lite': 'https://www.twitch.tv/meroxi',
};

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(streamMapper, teamA, teamB);
}

export async function getMatches(): Promise<Match[]> {
  try {
    const league = await getLeagueByName('Game Changers EMEA');
    if (league === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
      return [];
    }
    return (await getMatchesFromSpike(league, 3047, tricodeMapper, streamMapperFn));
  } catch {
    return [];
  }
}