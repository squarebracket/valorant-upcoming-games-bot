import { getLeagueByName } from "../../lib/leagues.ts";
import { Match, Team } from "../../lib/matches.ts";
import { streamMapperLookupFunction } from "../../lib/utils.ts";
import { getBattlefy } from "../battlefy.ts";

const battlefyStartTimeMapper = [
  '2024-03-07T23:30:00.000Z',
  '2024-03-09T22:00:00.000Z',
  '2024-03-09T23:30:00.000Z',
  '2024-03-10T22:00:00.000Z',
  '2024-03-11T00:00:00.000Z',
];

const battlefyStreamMapper = {
  'Psycho Cats': 'https://twitch.tv/tomatoluna',
  'Voyager Esports': 'https://twitch.tv/D3pr3ssion_',
  'pookie nation': 'https://twitch.tv/smol_bananya',
  'Team Aquila': 'https://twitch.tv/nessaroo',
  'womp womp': 'https://twitch.tv/mochimeiVAL',
  'YDZ Rose': 'https://twitch.tv/luxelyval',
  'Endure White': 'https://twitch.tv/ciiaba',
  'University of Waterloo White': 'http://twitch.tv/casslie',
  'HyperSpeed Ruby': 'https://twitch.tv/imthund3r0us',
  ':3': 'https://twitch.tv/the_lunafox',
  'Bumble Bees': 'https://twitch.tv/notaurelia_',
  'AIMPUNCH': 'https://twitch.tv/ayoeclipse',
  'smart fellas': 'https://www.twitch.tv/anniversary',
  'Loafing Cats': 'https://twitch.tv/kaebiiii',
};
const NAGCTricodeMapper = {
  'Version1': 'V1',
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
// const naQuals = new URL('https://dtmwra1jsgyb0.cloudfront.net/tournaments/65bac6adbb579346b1d3147b?extend%5Bstages%5D%5Bgroups%5D%5Bmatches%5D%5Btop.team%5D=true&extend%5Bstages%5D%5Bgroups%5D%5Bmatches%5D%5Bbottom.team%5D=true&extend%5Bstages%5D%5Bmatches%5D%5Btop.team%5D=true&extend%5Bstages%5D%5Bmatches%5D%5Bbottom.team%5D=true&extend%5Bstages%5D%5Bgroups%5D%5Bstandings%5D%5Bteam%5D=true&extend%5Bstages%5D%5Bstandings%5D%5Bteam%5D=true');

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(battlefyStreamMapper, teamA, teamB);
}

export async function getMatches(): Promise<Match[]> {
  const league = await getLeagueByName('Game Changers NA');
  if (!league) {
    console.error('unable to find league');
    throw new Error(`unable to find league`);
  }
  return (await getBattlefy('65bac6adbb579346b1d3147b', league, NAGCTricodeMapper, streamMapperFn));
}