import { TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";
import { getLeagueByName } from "../../lib/leagues.ts";
import { Team } from "../../lib/matches.ts";
import { getBattlefy } from "../battlefy.ts";

const streamMapper = {
  'Catnappers': 'https://twitch.tv/omgangle',
  //'Psycho Cats': 'https://twitch.tv/bloomana',
  //'ASTANE GC': 'https://twitch.tv/thebubblybunni',
  //'STARFIRE': 'https://twitch.tv/punkkup',
  'Day By Day': 'https://twitch.tv/risorah',
  'Skyline Dreamers GC': 'https://twitch.tv/cloodzzy',
  //'Alliance Angels': 'https://twitch.tv/jayccentric',
  //'vR GC': 'https://twitch.tv/ehzoue',
  //'626': 'https://twitch.tv/rperk',
  'scc +1': 'https://twitch.tv/awpi',
  //'ENVEE Sapphire': 'https://twitch.tv/shayellow',
  'VibinOut Blossoms': 'https://twitch.tv/mekyizishere',
  'Bumble Bees': 'https://twitch.tv/clocracy',
  //'Harmony Opal': 'https://twitch.tv/phoxic_na',
  //'Kryptic': 'https://twitch.tv/fallacyvl',
  //'DeToX GC': 'https://twitch.tv/mimiyaps',
  //'Mystics GC': 'https://twitch.tv/yungzephy',
  'HyperSpeed White': 'https://www.twitch.tv/jiajayna',
  //'LUNA Artemis GC': 'https://twitch.tv/mekyizishere',
  'minions united': 'https://twitch.tv/bittyybtw',
  'ENVEE Sapphire': 'https://twitch.tv/ogpaparoni',
  'Erinite GC': 'https://twitch.tv/anexcks',
  //'Dreamstation GC': 'https://twitch.tv/gemmasal',
  'Event Horizon GC': 'https://twitch.tv/zevcept',
  //'Paradox': 'https://twitch.tv/rperk',
  // 'Teddy Tactics': 'https://twitch.tv/endercasts',
  //'BAG': 'https://twitch.tv/alrightdani',
  //'Hearts and Kisses Esports': 'https://twitch.tv/alexiafoxxx',
  //'Mizzou Esports GC': 'https://twitch.tv/tippomy',
  // 'Tenax GC': 'https://twitch.tv/adrsh12_',
  //'Scenario Cats': 'https://twitch.tv/freelilly',
  //'National Yappers Association': 'https://twitch.tv/psyncc',
  'RITUAL RËAL': 'https://twitch.tv/mochimeival',
  'Everyone Really Misses': 'https://twitch.tv/miwly333',
  'U4RIA': 'https://twitch.tv/weevee82',
  'scooby snackers': 'https://twitch.tv/nomyyyy',
  'mesos millionaires': 'https://twitch.tv/aniemal',
  'LazerrFreeksIvy': 'https://twitch.tv/neeish',
  'SaD FROST': 'https://twitch.tv/stayvlr',
  'Purpose Gaming GC': 'https://twitch.tv/madsmoney666',
  'Tea Guzzlers': 'https://twitch.tv/sadliii_',
  'Chronic': 'https://twitch.tv/angejlz',

};

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  if (teamA && teamB && teamA.name === 'OVERKILL') {
    return 'https://twitch.tv/raidiantgg';
  }
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
  'U4RIA': 'U4R',
  'TBD': 'TBD',
  'Water gun warriors': 'WGW',
  'National Yappers Association': 'YAP',
  'RITUAL RËAL': 'RTL',
  'Tenax GC': 'TNX',
};

export async function getMatches() {
  const league = await getLeagueByName('Game Changers NA');
  if (!league) {
    throw new Error('no league');
  }
  return await getBattlefy('67e844233c70d700211eacc0', league, tricodeMapper, streamMapperFn, 'gc-quals');
}
