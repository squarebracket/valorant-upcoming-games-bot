import { TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";
import { getLeagueByName } from "../../lib/leagues.ts";
import { Team } from "../../lib/matches.ts";
import { getBattlefy } from "../battlefy.ts";

const streamMapper = {
  'RyZ Eclipsa GC': 'https://twitch.tv/omgangle',
  'Psycho Cats': 'https://twitch.tv/bloomana',
  'ASTANE GC': 'https://twitch.tv/thebubblybunni',
  'Loafing Cats': 'https://twitch.tv/nexesfps',
  'Catnappers': 'https://twitch.tv/oviaplays',
  'STARFIRE': 'https://twitch.tv/punkkup',
  'SaD GC': 'https://twitch.tv/risorah',
  'Skyline Dreamers GC': 'https://twitch.tv/banjuwu',
  'Alliance Angels': 'https://twitch.tv/jayccentric',
  '42C CRAYOLA PACK': 'https://twitch.tv/zevcept',
  'Cafe Coke': 'https://twitch.tv/ehzoue',
  '626': 'https://twitch.tv/rperk',
  'C4C Flare': 'https://twitch.tv/awpi',
  'LAB White': 'https://twitch.tv/shayellow',
  'VO Blossoms': 'https://twitch.tv/mekyizishere',
  'Bumble Bees': 'https://twitch.tv/notaurelia_',
  'Harmony Opal': 'https://twitch.tv/phoxic_na',
  'Kryptic': 'https://twitch.tv/fallacyvl',
};

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(streamMapper, teamA, teamB);
}

const tricodeMapper: TricodeMapper = {
  'Overkill Black': 'OVK',
  'FaZe Clan GC': 'FAZE',
  '$10 DM FEE': '$10',
  'FlyQuest RED': 'FLY.R',
  'Disguised GC': 'DSG',
  'Evil Geniuses GC': 'EG.GC',
  'Chosen 1s Black': 'C1B',
  'Shopify Rebellion GC': 'SR.GC',
  'Shopify Rebellion': 'SR',
  'Team Karma': 'TK',
  'Unspoken Rizz': 'UNSP',
  'Solidarity': 'SOLI',
  'Solidarity GC': 'SOLI',
  'XSET': 'XSET',
  'Gen.G Black': 'GENG',
  'Complexity GX3': 'COL',
  'Supernova Galaxy': 'SNG',
  'Infiniti X': 'INFI',
  'YFP Remix': 'YFP',
  'Team Insomniacs': 'TEAM',
  'Teddy Tactics': 'TDY',
  'QoR GC': 'QOR.GC',
  'SOMETHING2PROVE': 'SOME',
  'BreakThru GC': 'BRK.GC',
  'Figure8': 'FIGU',
  'Velaris': 'VEL',
  'Nocturnal': 'NOCT',
  'Misfits Black': 'MSF',
  'Gosu GC': 'GOSU',
  'Potter Posse': 'POTT',
  'otter pops': 'OTTE',
  'UW White': 'UWU',
  'Yacht Club Pink': 'YCHT',
  'Loafing Cats': 'LFCS',
  'unpaid dogs': 'DOG',
  'Passion Project': 'PP',
  'Infinity X': 'INF',
  'SERENDIPITY': 'PITY',
  'Serendipity': 'PITY',
  'The Boys': 'TB',
  'Berzerkers Night': 'BZK',
  'mesos millionaires': 'MESO',
  "misu's qts": 'QTS',
  'U4RIA Azalea': 'U4R',
  'TBD': 'TBD',
};

export async function getMatches() {
  const league = await getLeagueByName('Game Changers NA');
  if (!league) {
    throw new Error('no league');
  }
  return await getBattlefy('662436e173911d2090ddeac1', league, tricodeMapper, streamMapperFn, 'gc-quals');
}