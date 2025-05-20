import { getLeagueByName } from "../../lib/leagues.ts";
import { Team } from "../../lib/matches.ts";
import { TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";
import { StartTimeMapper, getChallonge } from "../challonge.ts";

const streamMapper = {
  // 'Deviant Topaz': 'https://www.twitch.tv/kiarafordel',
  // 'LILITH': 'https://www.twitch.tv/rakerzzzgg',
};

const streamMapperFn = (teamA?: Team, teamB?: Team) => {
  return streamMapperLookupFunction(streamMapper, teamA, teamB);
}

const tricodeMapper: TricodeMapper = {
  'Xipto Esports': 'XIP',
  'Sinchro Tozen': 'SINC',
  'PSEUDO': 'PSEU',
  '7Stellar Nebula': '7STE',
  'Netnoble-GC': 'NETN',
  'Ravenous E-Sports': 'RAVE',
  'Flare Demons': 'FLD',
  'SYNC PINK': 'SYNC',
  'Deviant Topaz': 'DVT',
  'Fear Eater Sierra': 'FTR.S',
  'Glass Girls': 'GG',
  'LILITH': 'LILI',
  'Blue Butterflies': 'BLUE',
  'Halo Freyja': 'HALO',
  'RAVENOUS': 'RAVE',
  'X1 Esports': 'X1',
  'Hiraya Manawari': 'HIRA',
  'Xinh Gai Tay': 'XINH',
  'Levana Estrella': 'LEVA',
  'Reseda OKAMI': 'RESE',
  'Girls Just Wanna Have Fun': 'GIRL',
  'Aura Differential': 'AURA',
  'DTGirls': 'DT',
  'Last Minute': 'LAST',
  'Chérie': 'CHE',
  'SOL Mayari': 'SOL',
  'NANA AND FRIENDS': 'NF',
  'Astra Millennia': 'AST',
};

const startTimeMapper: StartTimeMapper = (m, tourney) => {
  const match = m.match;
  const tourneyStart = new Date(tourney.tournament.start_at);
  const round = match.round;
  tourneyStart.setDate(tourneyStart.getDate() + (round - 1));
  return tourneyStart;
}

export async function getMatches() {
  const league = await getLeagueByName('Game Changers SEA');
  if (!league) {
    throw new Error('no league');
  }
  return (await getChallonge('GCSEA25Split2Swiss', league, tricodeMapper, startTimeMapper));
}
