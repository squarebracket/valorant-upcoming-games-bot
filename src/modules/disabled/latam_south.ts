import { getArenaGG } from "../arenagg.ts";
import { getMatchesFromScraped } from "../vlr_scraper.ts";
import { getLeagueByName } from "../../lib/leagues.ts";
import { Match } from "../../lib/matches.ts";
import { StreamMapper, TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";

const tricodeMapper: TricodeMapper = {
  '9z FEM': '9Z',
  'Krows Corax': 'KROW',
  'KRU blaze': 'KRU',
  'TITANIC': 'TNC',
  'Bellakitas': 'BT',
  'NEKOMA TEAM': 'NKM',
  'University War': 'UW',
}

const streamMapper: StreamMapper = {
  '9Z': 'https://www.twitch.tv/zuguiita',
  'KROW': 'https://www.twitch.tv/teamkrowcba',
}

export async function getMatches(): Promise<Match[]> {
  const league = await getLeagueByName('Game Changers LATAM');
  if (!league) {
    throw new Error('unable to find latam gc league');
    return [];
  }
  return (await getMatchesFromScraped(league, 2129, tricodeMapper, (a, b) => 'https://www.twitch.tv/syncfireesports'));
  //return (await getArenaGG(164765, league, tricodeMapper, (a, b) => streamMapperLookupFunction(streamMapper, a, b)));
}
