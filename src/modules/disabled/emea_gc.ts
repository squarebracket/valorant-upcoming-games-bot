import { League, getLeagueByName } from "../../lib/leagues.ts";
import { getMatchesFromScraped } from "../vlr_scraper.ts";

const EMEAGCTricodeMapper = {
  'BBL Queens': 'BBL.Q',
  'G2 Gozen': 'G2.G',
  'Rebels Gaming Velvet': 'RBLS',
  'Rebels Velvet': 'RBLS',
  'CBA': 'CBA',
  'Alliance Coven': 'ALL.C',
  'UNtapped': 'UNtapped',
  'ex-UNtapped': 'ex-UNtapped',
  'NAVI Celestials': 'NAVI.C',
  'FOKUS Sakura': 'FKS.S',
  'Acend Rising': 'ACE',
  'GUILD X': 'GLD.X',
  'Guild': 'GLD.X',
  'Karmine Corp GC': 'KC.GC',
  'NIP Lightning': 'NIP.LI',
  'CASE HYDRA': 'CASE',
  'KPI Shine': 'KPI.S',
  'Team Falcons Vega': 'FLC.V',
  'Geekay Esports Cherry': 'GK',
  'TIGER Anonymo': 'T.AM',
  'FUT Female': 'FUT.FE',
  'FUT Esports': 'FUT.FE',
  'The A Team': 'TAT',
  'EXCEL': 'XL.GC',
  'Odd 1 OUT': 'O1O',
  'DSYRE': 'DSY',
  'NASR Ignite': 'NSR.I',
  'NEON BLADE': 'NEON',
  'VALIANT GC': 'VLNT',
  'MAD Lions KOI': 'MDK',
  'GIANTX GC': 'GIAN',
  'HEROIC Valkyries': 'HERO',
  'ALTERNATE aTTaX Ruby': 'ATN',
};

export async function getMatches() {
  const league = await getLeagueByName('Game Changers EMEA');
  if (!league) {
    console.error('UNABLE TO FIND LEAGUE');
    return [];
  }
  return (await
    getMatchesFromScraped(
      league,
      2181,
      EMEAGCTricodeMapper,
      () => 'https://twitch.tv/dive_gg'
    )
  );
}
