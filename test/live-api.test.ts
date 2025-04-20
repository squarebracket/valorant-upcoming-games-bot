import { describe, expect, test, jest, beforeAll } from '@jest/globals';
import { Match } from '../src/lib/matches.ts';
import { getLeagueByName } from '../src/lib/leagues.ts';
import { getBattlefy } from '../src/modules/battlefy.ts';
import { getGamersClub } from '../src/modules/gamersclub.ts';
import { getChallonge, StartTimeMapper } from '../src/modules/challonge.ts';
import { getArenaGG } from '../src/modules/arenagg.ts';
import { getQQ } from '../src/modules/qq.ts';
import { getLvlUpMatchesForTourney } from '../src/modules/lvupgg.ts';

import { emotes } from './lib/emotes.ts';

jest.mock('../src/lib/client.ts', () => {
  return {
    getClient: () => {
      return {
        emojis: {
          cache: emotes
        }
      }
    }
  }
});

describe("hit live apis", () => {

  test('battlefy', async () => {
    const league = await (getLeagueByName('Game Changers NA'));
    const matches = (await getBattlefy('674a4769a29445003fb4611a', league, {}));
    expect(matches).toMatchSnapshot();
  });

  test('gamersclub', async () => {
    const league = await getLeagueByName('Game Changers BR');
    const matches = (await getGamersClub(3126, league, {}));
    expect(matches).toMatchSnapshot();
  });

  test('qq', async () => {
    const league = await getLeagueByName('Game Changers China');
    const matches = await getQQ(1000022, league, () => `https://www.twitch.tv/valorantesports_cn`);
    expect(matches).toMatchSnapshot();
  })

  test('challonge', async () => {
    // example start time mapper, should probably make this better
    const startTimeMapper: StartTimeMapper = (m, tourney) => {
      const match = m.match;
      const tourneyStart = new Date(tourney.tournament.start_at);
      const round = match.round;
      tourneyStart.setDate(tourneyStart.getDate() + (round - 1));
      return tourneyStart;
    }

    const league = await getLeagueByName('Game Changers SEA');
    const matches = (await getChallonge('GCSEA25Split1Swiss', league, {}, startTimeMapper));

    expect(matches).toMatchSnapshot();
  });

  test('lvlupgg', async () => {
    const league = await getLeagueByName('Game Changers KR');
    const matches = await getLvlUpMatchesForTourney('647995405faa9a0007bf9f9c', league, {});
    expect(matches).toMatchSnapshot();
  });

});