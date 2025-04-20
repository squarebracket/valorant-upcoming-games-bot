import { describe, expect, test, jest } from '@jest/globals';

import { getLeagueByName } from '../src/lib/leagues.ts';
import { getBattlefy } from '../src/modules/battlefy.ts';
import * as utils from '../src/lib/utils.ts';

import { tourneyJson as nagc_gsl_single } from './data/battlefy_nagc_gsl_single.ts';
import leaguesJson from './data/leagues.json';
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

jest.mock('../src/lib/utils.ts', () => {
  return {
    doRequest: (url: URL, options) => {
      if (url.href.includes('getLeaguesForStandings')) {
        return Promise.resolve(leaguesJson);
      } else if (url.href.includes('cloudfront.net/tournaments/66f5d01a70020f0022f63314')) {
        return Promise.resolve(nagc_gsl_single);
      }
    },
  };
});

describe("battlefy parser tests", () => {
  
  test("minimal args", async () => {
    const league = await getLeagueByName("Game Changers NA");
    const matches = await getBattlefy('66f5d01a70020f0022f63314', league);
    expect(matches).toMatchSnapshot();
  })
  
});