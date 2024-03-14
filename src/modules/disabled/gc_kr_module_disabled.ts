import { getLvlUpMatchesForTourney } from "../lvupgg.ts";
import { getLeagueByName } from "../../lib/leagues.ts";
import { Match } from "../../lib/matches.ts";

const KoreaGCMapper = {
  'Lunatic-hai flax': 'LH.F',
  'Nuclear GC': 'NC',
  'CVA': 'CVA',
  'Obelisk': 'OB',
  'GGA GC': 'GGA',
  'TEAM Improve GC': 'IV',
  'BSG GC': 'BSG',
  'FiveStar-Class': 'FiveStar-Class',
  'BRILLIANT': 'BRILLIANT',
  'LDN GC': 'LDN',
  'Medium_Rare': 'Medium Rare',
}

export async function getMatches(): Promise<Match[]> {
  try {
    const league = await getLeagueByName('Game Changers KR');
    return await getLvlUpMatchesForTourney('647995405faa9a0007bf9f9c', league!, KoreaGCMapper);
  } catch {
    return [];
  }
}