import { get } from 'node:https';

import { Match, Team, sortMatchesByLeague } from './matches.ts';
import { League } from './leagues.ts';

const headers = {
  'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z',
  'user-agent': 'valorant-upcoming-matches-bot',
  'accept': '*/*',
};

export function doRequest(url: URL, parseJson?: boolean): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = get(url, { headers }, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error: Error | undefined;
      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
          `Status Code: ${statusCode}`);
      } else if (contentType && !/^application\/json/.test(contentType) && parseJson !== false) {
        error = new Error('Invalid content-type.\n' +
          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        return;
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          if (parseJson !== false) {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } else {
            resolve(rawData);
          }
        } catch (e) {
          if (e instanceof Error) {
            console.error(e.message);
            reject(e.message);
          }
        }
      });
    }).on('error', (e: any) => {
      console.log(e);
      console.error(`Got error: ${e.message}`);
      reject(e.message);
    });
  });
}

export const bestOfTimeMapper = {
  0: 0,
  1: 60 * 60 * 1000,
  3: 120 * 60 * 1000,
  5: 180 * 60 * 1000,
};

export type StreamMapper = { [key: string]: string };
export type StreamMapperFunction = (teamA?: Team, teamB?: Team) => string | undefined;

export function streamMapperLookupFunction(streamMapper: StreamMapper, teamA?: Team, teamB?: Team): string | undefined {
  if (teamA && streamMapper[teamA.code]) {
    return streamMapper[teamA.code];
  } else if (teamA && streamMapper[teamA.name]) {
    return streamMapper[teamA.name];
  } else if (teamB && streamMapper[teamB.code]) {
    return streamMapper[teamB.code];
  } else if (teamB && streamMapper[teamB.name]) {
    return streamMapper[teamB.name];
  } else {
    return undefined;
  }
}

export function getMatchesByLeague(matches: Match[]) {

  matches = sortMatchesByLeague(matches);

  const matchesByLeague: { 
    'vct': { [key: string]: { league: League, matches: Match[] } },
    'chal': { [key: string]: { league: League, matches: Match[] } },
    'gc': { [key: string]: { league: League, matches: Match[] } },
  } = {
    'vct': {},
    'chal': {},
    'gc': {},
  };

  matches.forEach((match) => {
    let key: 'vct' | 'chal' | 'gc' = 'vct';
    if (/challengers/i.test(match.league.name)) {
      key = 'chal';
    } else if (/game changers/i.test(match.league.name)) {
      key = 'gc';
    }
    if (!matchesByLeague[key][match.league.name]) {
      matchesByLeague[key][match.league.name] = { league: match.league, matches: [] };
    }
    matchesByLeague[key][match.league.name].matches.push(match);
  });

  console.log(matchesByLeague);
  return matchesByLeague;
}

export type TricodeMapper = { [key: string]: string };