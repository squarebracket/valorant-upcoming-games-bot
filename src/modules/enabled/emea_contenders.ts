import { getLeagueByName } from "../../lib/leagues.ts";
import { Match, Team } from "../../lib/matches.ts";
import { streamMapperLookupFunction } from "../../lib/utils.ts";
import { getMatchesFromToornament } from "../toornament_scraper.ts";

const tricodeMapper = {
  'Twisted Minds Orchids': 'TWIS',
  'Silly Weapons All Game': 'SWAG',
  'RIZON Sugar': 'RZN',
  'VALIANT GC': 'VALIANT',
  'Formulation GC': 'FMG',
  'MAD Lions KOI': 'MDK',
  'F9 Wonders': 'F9',
  'ALTERNATE aTTaX Ruby': 'ATN',
  'BLVKHVND': 'HVND',
  'FOKUS Sakura': 'FOKUS',
  'LUA Gaming': 'LUA',
  'On Sight': 'OS',
  'LXT Esports': 'LXT',
  'Zerance Mint': 'ZER',
  'The Ultimates Odyssey': 'TU',
  'TOG Kitsune': 'TOG',

};

const streamMapper = {
  // 'MAD Lions KOI': 'https://www.twitch.tv/SergioFFerra',
  // 'Karmine Corp Female': 'https://www.twitch.tv/helydia',
  'BLVKHVND': 'https://twitch.tv/blvkhvnd',
  'Gamax Lite': 'https://twitch.tv/meroxi',
  'VALIANT GC': 'https://twitch.tv/valiantofficial',
  'F9 Wonders': 'https://twitch.tv/f9hetic',
  'Formulation GC': 'https://twitch.tv/formulationgaming',
  'ALTERNATE aTTaX Ruby': 'https://twitch.tv/atnattax',
  'FOKUS Sakura': 'https://twitch.tv/bshray_',
  'LUA Gaming': 'https://twitch.tv/andreoide7',
  'Zerance Mint': 'https://twitch.tv/getdeluxe',
  // 'On Sight': 'https://twitch.tv/theblayder',
  'MAD Lions KOI': 'https://twitch.tv/alessiacn_',
  'Silly Weapons All Game': 'https://twitch.tv/wardwarfow',
  'Twisted Minds Orchids': 'https://twitch.tv/sayfdj',
  'Celestials': 'https://twitch.tv/ekocasts',
  'TOG Kitsune': 'https://www.twitch.tv/akamask_colonia',
  'charbon': 'https://www.twitch.tv/iamja2',
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
    return (await getMatchesFromToornament(league, '8730775566302658560', tricodeMapper, streamMapperFn));
  } catch {
    return [];
  }
}
