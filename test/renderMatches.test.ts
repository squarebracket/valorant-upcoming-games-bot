import { describe, expect, test, jest, beforeAll } from '@jest/globals';

import { getLeagueByName } from '../src/lib/leagues.ts';
import { getBattlefy } from '../src/modules/battlefy.ts';
import * as utils from '../src/lib/utils.ts';

import { tourneyJson } from './data/battlefy_nagc_gsl_single.ts';
import leaguesJson from './data/leagues.json';
import { emotes } from './lib/emotes.ts';
import { Match } from '../src/lib/matches.ts';
import { renderLiveMatch, renderUpcomingMatch } from '../src/renderMatch.ts';

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
      }
    },
  };
});

describe("live match line rendering", () => {

  test("no teams", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`TBD vs TBD`);
  });

  test("1 team", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC vs TBD`);
  });

  test("2 teams", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
      },
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC vs DEF`);
  });

  test("2 teams, stream", async () => {
    const stream = new URL('https://twitch.tv/valorant_americas');
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
      },
      stream: stream,
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC vs DEF @ <${stream}>`);
  });

  test("1 team, stream", async () => {
    const stream = new URL('https://twitch.tv/valorant_americas');
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
      stream: stream,
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC vs TBD @ <${stream}>`);
  });

  test("teams, only 1 score", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        result: {
          mapWins: 1,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
      },
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC vs DEF`);
  });

  test("teams, 2 scores, no BO", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        result: {
          mapWins: 1,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
        result: {
          mapWins: 0,
        },
      },
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC vs DEF (Series Score: ABC 1-0 DEF)`);
  });

  test("teams, 2 scores + BO3", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        result: {
          mapWins: 1,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
        result: {
          mapWins: 0,
        },
      },
      strategy: {
        count: 3,
        type: 'bestOf',
      },
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC vs DEF (BO3 Series Score: ABC 1-0 DEF)`);
  });

  test("teams, BO3", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
      },
      strategy: {
        count: 3,
        type: 'bestOf',
      },
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC vs DEF (BO3)`);
  });

  test("2 teams, standings", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        record: {
          wins: 1,
          losses: 2,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
        record: {
          wins: 3,
          losses: 0,
        },
      },
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC (1-2) vs DEF (3-0)`);
  });

  test("2 teams, standings, BO5", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        record: {
          wins: 1,
          losses: 2,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
        record: {
          wins: 3,
          losses: 0,
        },
      },
      strategy: {
        count: 5,
        type: 'bestOf',
      }
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC (1-2) vs DEF (3-0) (BO5)`);
  });
  
  test("full", async () => {
    const stream = new URL('https://twitch.tv/valorant_americas');
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        result: {
          mapWins: 2,
        },
        record: {
          wins: 1,
          losses: 2,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
        result: {
          mapWins: 1,
        },
        record: {
          wins: 3,
          losses: 0,
        },
      },
      strategy: {
        count: 5,
        type: 'bestOf',
      },
      stream: stream,
    };
    const msg = renderLiveMatch(match);
    expect(msg).toEqual(`ABC (1-2) vs DEF (3-0) (BO5 Series Score: ABC 2-1 DEF) @ <${stream}>`);
  });

});

describe('upcoming match line rendering', () => {

  const discTime = `<t:${new Date('2025-05-01T00:00:00Z').valueOf() / 1000}:F>`;

  test("no teams", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'upcoming',
    };
    const msg = renderUpcomingMatch(match);
    expect(msg).toEqual(`TBD vs TBD ${discTime}`);
  });

  test("1 team", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
    };
    const msg = renderUpcomingMatch(match);
    expect(msg).toEqual(`ABC vs TBD ${discTime}`);
  });

  test("2 teams", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
      },
    };
    const msg = renderUpcomingMatch(match);
    expect(msg).toEqual(`ABC vs DEF ${discTime}`);
  });

  test("2 teams, stream", async () => {
    // should be identical to no stream
    const stream = new URL('https://twitch.tv/valorant_americas');
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
      },
      stream: stream,
    };
    const msg = renderUpcomingMatch(match);
    expect(msg).toEqual(`ABC vs DEF ${discTime}`);
  });

  test("teams, 2 scores, no BO", async () => {
    // should be identical to no scores
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        result: {
          mapWins: 1,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
        result: {
          mapWins: 0,
        },
      },
    };
    const msg = renderUpcomingMatch(match);
    expect(msg).toEqual(`ABC vs DEF ${discTime}`);
  });

  test("teams, BO3", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
      },
      strategy: {
        count: 3,
        type: 'bestOf',
      },
    };
    const msg = renderUpcomingMatch(match);
    expect(msg).toEqual(`ABC vs DEF ${discTime} (BO3)`);
  });

  test("2 teams, standings", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        record: {
          wins: 1,
          losses: 2,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
        record: {
          wins: 3,
          losses: 0,
        },
      },
    };
    const msg = renderUpcomingMatch(match);
    expect(msg).toEqual(`ABC (1-2) vs DEF (3-0) ${discTime}`);
  });

  test("2 teams, standings, BO5", async () => {
    const match: Match = {
      startTime: new Date('2025-05-01T00:00:00Z'),
      league: await getLeagueByName('VCT Americas'),
      state: 'live',
      teamA: {
        code: 'ABC',
        name: 'Adequately Big Cats',
        record: {
          wins: 1,
          losses: 2,
        },
      },
      teamB: {
        code: 'DEF',
        name: 'Definitely Eastern Forks',
        record: {
          wins: 3,
          losses: 0,
        },
      },
      strategy: {
        count: 5,
        type: 'bestOf',
      }
    };
    const msg = renderUpcomingMatch(match);
    expect(msg).toEqual(`ABC (1-2) vs DEF (3-0) ${discTime} (BO5)`);
  });

});