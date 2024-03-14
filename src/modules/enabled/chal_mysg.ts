import { getLeagueByName } from "../../lib/leagues.ts";
import { Match, Team } from "../../lib/matches.ts";
import { streamMapperLookupFunction } from "../../lib/utils.ts";
import { getMatchesFromScraped } from "../vlr_scraper.ts";

const tricodeMapper = {
  'Disguised': 'DSG',
  'Blitz Esports': 'BZE',
  'LaZe': 'LZE',
  'ORGLESS': 'LESS',
  'NEXGA': 'NXGA',
  'ENDER': 'END',
  'Ninjas in Galaxy': 'NG',
  "Please Don't Fire": 'PDF',
};

const streamMapper = {
  'DSG': 'https://twitch.tv/DisguisedToast',
  'NG': 'https://www.twitch.tv/Coldan_',
  'BZE': 'https://www.twitch.tv/tashbunny',
  'LZE': 'https://www.twitch.tv/tashbunny',
  'LESS': 'https://www.twitch.tv/tashbunny',
  'NXGA': 'https://www.twitch.tv/tashbunny',
  'END': 'https://www.twitch.tv/tashbunny',
  'PDF': 'https://www.twitch.tv/tashbunny',
};

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(streamMapper, teamA, teamB);
}

export async function getMatches(): Promise<Match[]> {
  try {
    const league = await getLeagueByName('Challengers SEA MY & SG');
    if (league === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
      return [];
    }
    return (await getMatchesFromScraped(league, 1956, tricodeMapper, streamMapperFn));
    // return (await getMatchesFromScraped(league, 'chal-mysg.json', tricodeMapper, streamMapperFn));
  } catch {
    return [];
  }
}