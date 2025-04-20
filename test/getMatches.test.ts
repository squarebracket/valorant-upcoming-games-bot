import { getMatches } from "../src/getMatches.ts";
import { describe, expect, test, jest } from '@jest/globals';
import { AnnotatedFunction, FunctionInfo } from "../src/getModules.ts";
import { getLeagueByName } from "../src/lib/leagues.ts";
import { Match } from "../src/lib/matches.ts";
import { emotes } from './lib/emotes.ts';

let mockedMatchGetters: { [key: string]: FunctionInfo } = {};



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

jest.mock('../src/getModules.ts', () => {
  return {
    getModules: () => mockedMatchGetters,
  }
});

jest.mock('../src/lib/storage.ts', () => {
  return {
    Config: {
      findOne: () => {
        get: (column: string) => {
          if (column === 'mainLeagueIds') {
            return []
          } else {
            return [];
          }
        }
      }
    }
  }
});

test('getMatches', async () => {

  const gcNa = await getLeagueByName('Game Changers NA');
  const gcSEA = await getLeagueByName('Game Changers SEA');
  const gcBR = await getLeagueByName('Game Changers BR');

  const time = new Date(Date.now() + 5000);
  const timeRendered = `<t:${time.valueOf() / 1000}:F>`

  const testFn1 = async (): Promise<Match> => {
    return {
      league: gcNa,
      startTime: time,
      state: 'upcoming',
      teamA: {
        name: 'Plan Bri',
        code: 'Plan Bri',
        result: {
          mapWins: 1
        }
      },
      teamB: {
        name: 'Harmony Opal',
        code: 'Harmony Opal',
        result: {
          mapWins: 0
        }
      }
    }
  };
  testFn1.file = 'dummy-1.ts';
  const testFn2 = async (): Promise<Match> => {
    return {
      league: gcSEA,
      startTime: time,
      state: 'upcoming',
      teamA: {
        name: 'Xipto Esports',
        code: 'Xipto Esports',
        record: {
          wins: 1,
          losses: 0
        },
        result: {
          mapWins: 2
        }
      },
      teamB: {
        name: 'LILAX',
        code: 'LILAX',
        record: {
          wins: 0,
          losses: 1,
        },
        result: {
          mapWins: 0
        }
      }
    }
  };
  testFn2.file = 'dummy-2.ts';

  const testFn3 = async (): Promise<Match> => {
    return {
      league: gcBR,
      startTime: time,
      state: 'upcoming',
      teamA: {
        name: 'Team Stella',
        code: 'TS',
        result: {
          mapWins: 0,
        }
      },
      teamB: {
        name: 'Kiwizitos',
        code: 'KWZ',
        result: {
          mapWins: 2
        }
      },
      strategy: {
        type: 'bestOf',
        count: 3
      }
    }
  };
  testFn3.file = 'dummy-3.ts';

  mockedMatchGetters = {
    'test1': {
      getMatches: testFn1,
      mtime: 0,
    },
    'test2': {
      getMatches: testFn2,
      mtime: 0,
    },
    'test3': {
      getMatches: testFn3,
      mtime: 0,
    }
  }

  const matches = await getMatches(undefined, 'test');
  const returnText = `**UPCOMING (NEXT 168H)**

<:game_changers_na:>__Game Changers NA__
Plan Bri vs Harmony Opal ${timeRendered}

<:game_changers_sea:>__Game Changers SEA__
Xipto Esports (1-0) vs LILAX (0-1) ${timeRendered}

<:game_changers_series_brazil:>__Game Changers BR__
TS vs KWZ ${timeRendered} (BO3)`;
  expect(matches).toEqual(returnText);
});