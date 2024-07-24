import { TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";
import { getLeagueByName } from "../../lib/leagues.ts";
import { Team } from "../../lib/matches.ts";
import { getBattlefy } from "../battlefy.ts";

const streamMapper = {
  'Catnappers': 'https://twitch.tv/omgangle',
  'Psycho Cats': 'https://twitch.tv/bloomana',
  'ASTANE GC': 'https://twitch.tv/thebubblybunni',
  'STARFIRE': 'https://twitch.tv/punkkup',
  'SaD GC': 'https://twitch.tv/risorah',
  'Skyline Dreamers GC': 'https://twitch.tv/banjuwu',
  'Alliance Angels': 'https://twitch.tv/jayccentric',
  'vR GC': 'https://twitch.tv/ehzoue',
  '626': 'https://twitch.tv/rperk',
  'C4C Flare': 'https://twitch.tv/awpi',
  'LAB White': 'https://twitch.tv/shayellow',
  'VO Blossoms': 'https://twitch.tv/mekyizishere',
  'Bumble Bees': 'https://twitch.tv/clocracy',
  'Harmony Opal': 'https://twitch.tv/phoxic_na',
  'Kryptic': 'https://twitch.tv/fallacyvl',
  'DeToX GC': 'https://twitch.tv/mimiyaps',
  'Mystics GC': 'https://twitch.tv/yungzephy',
  'LUNA Artemis GC': 'https://twitch.tv/mekyizishere',
  'minions united': 'https://twitch.tv/bittyybtw',
  'Water gun warriors': 'https://twitch.tv/ogpaparoni',
  'EbonyX GC': 'https://twitch.tv/anexcks',
  'Dreamstation GC': 'https://twitch.tv/gemmasal',
  'Event Horizon GC': 'https://twitch.tv/zevcept',
  'Paradox': 'https://twitch.tv/rperk',
  'Teddy Tactics': 'https://twitch.tv/endercasts',
  'BAG': 'https://twitch.tv/alrightdani',
  'Hearts and Kisses Esports': 'https://twitch.tv/alexiafoxxx',
  'Mizzou Esports GC': 'https://twitch.tv/tippomy',
  'TENAX GC': 'https://twitch.tv/adrsh12_',
  'Scenario Cats': 'https://twitch.tv/freelilly',
  'National Yappers Association': 'https://twitch.tv/psyncc',
  'RITUAL RËAL': 'https://twitch.tv/mochimeival',
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
  'U4RIA Magnolia': 'U4R',
  'TBD': 'TBD',
  'Water gun warriors': 'WGW',
  'National Yappers Association': 'YAP',
  'RITUAL RËAL': 'RTL',
};

export async function getMatches() {
  const league = await getLeagueByName('Game Changers NA');
  if (!league) {
    throw new Error('no league');
  }
  return await getBattlefy('66845827fd0a1a052acad57d', league, tricodeMapper, streamMapperFn, 'gc-quals');
}
