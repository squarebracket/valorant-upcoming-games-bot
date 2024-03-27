import { getLeagueByName } from "../../lib/leagues.ts";
import { Team } from "../../lib/matches.ts";
import { TricodeMapper, streamMapperLookupFunction } from "../../lib/utils.ts";
import { StartTimeMapper, getChallonge } from "../challonge.ts";

const streamMapper = {
  'Deviant Topaz': 'https://www.twitch.tv/kiarafordel',
  'LILITH': 'https://www.twitch.tv/rakerzzzgg',
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
  if (round === 2) {
    tourneyStart.setDate(tourneyStart.getDate() + 1);    
  } else if (round === 3) {
    tourneyStart.setDate(tourneyStart.getDate() + 1);    
    tourneyStart.setMinutes(tourneyStart.getMinutes() + 60);
  } else if (round === 4) {
    tourneyStart.setDate(tourneyStart.getDate() + 2);    
  } else if (round === 5) {
    tourneyStart.setDate(tourneyStart.getDate() + 3);
  } else if (round === 6) {
    tourneyStart.setDate(tourneyStart.getDate() + 3);
    tourneyStart.setMinutes(tourneyStart.getMinutes() + 60);
  }
  return tourneyStart;
}

export async function getMatches() {
  const league = await getLeagueByName('Game Changers SEA');
  if (!league) {
    throw new Error('no league');
  }
  return await getChallonge(14266169, league, tricodeMapper, startTimeMapper, streamMapperFn);
}