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

const tricodeMapper: TricodeMapper = {};

const startTimeMapper: StartTimeMapper = (m, tourney) => {
  const match = m.match;
  const tourneyStart = new Date('2025-03-18T04:00:00.000-0400');
  const round = match.round;
  tourneyStart.setDate(tourneyStart.getDate() + (round - 1));
  return tourneyStart;
}

export async function getMatches() {
  const league = await getLeagueByName('Game Changers OCE');
  if (!league) {
    throw new Error('no league');
  }
  return (await getChallonge('GCOCE25Split1Swiss', league, tricodeMapper, startTimeMapper));
}
