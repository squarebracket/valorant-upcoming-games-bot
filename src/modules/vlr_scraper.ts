import { readFileSync } from 'node:fs';

import { parse } from 'node-html-parser';

import { Match, MatchState, Team } from "../lib/matches.ts";
import { League } from '../lib/leagues.ts';
import { StreamMapperFunction, TricodeMapper } from '../lib/utils.ts';
import { doRequest } from '../lib/utils.ts';

type ScrapedMatch = {
  startTime: Date;
  teamA: string;
  teamB: string;
  scoreA: string;
  scoreB: string;
}

async function scraper(tourneyId: number) {
  const scraped: ScrapedMatch[] = [];
  const url = new URL(`https://www.vlr.gg/event/matches/${tourneyId}`);
  const html = await doRequest(url, {parseJson: false});
  const root = parse(html);
  const links = root.querySelectorAll('a[class*="wf-module-item match-item"]');
  links.forEach(matchEl => {
    try {
      const status = matchEl.querySelector('div.ml-status').innerText.trim();
      if (status === 'Completed') {
        return;
      }
      const date = matchEl.parentNode.previousElementSibling.firstChild.innerText.trim();
      const time = matchEl.querySelector('.match-item-time').innerText.trim();
      const startTime = new Date(`${date} ${time}`);

      const [a, b] = matchEl.querySelectorAll('div.match-item-vs-team');
      const teamA = a.querySelector('div.match-item-vs-team-name').innerText.trim();
      const scoreA = a.querySelector('div.match-item-vs-team-score').innerText.trim();
      const teamB = b.querySelector('div.match-item-vs-team-name').innerText.trim();
      const scoreB = b.querySelector('div.match-item-vs-team-score').innerText.trim();

      scraped.push({
        startTime,
        teamA,
        teamB,
        scoreA,
        scoreB,
      });
    } catch {
      console.error(`problem scraping ${url}: ${matchEl}`);
    }
  });
  return scraped;
}


export async function getMatchesFromScraped(
  league: League,
  tourneyId: number,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction,
): Promise<Match[]> {
  console.log('TESTING');
  const matches: Match[] = [];
  const scraped = await scraper(tourneyId);
  scraped.forEach((match) => {
    const state: MatchState = (new Date() > match.startTime) ? 'live' : 'upcoming';
    const newMatch: Match = {
      startTime: match.startTime,
      league: league,
      state: state,
    };
    if (match.teamA !== 'TBD') {
      newMatch.teamA = {
        name: match.teamA,
        code: tricodeMapper[match.teamA] || match.teamA,
      };
      if (match.scoreA !== '–') {
        newMatch.teamA.result = {
          mapWins: parseInt(match.scoreA),
        };
      }
    }

    if (match.teamB !== 'TBD') {
      newMatch.teamB = {
        name: match.teamB,
        code: tricodeMapper[match.teamB] || match.teamB,
      };
      if (match.scoreB !== '–') {
        newMatch.teamB.result = {
          mapWins: parseInt(match.scoreB),
        };
      }
    }

    if (state === 'live' && streamMapperFn !== undefined) {
      // match is live
      const stream = streamMapperFn(newMatch.teamA, newMatch.teamB);
      if (stream) {
        newMatch.stream = new URL(stream);
      }
    }

    if (state === 'live' && !newMatch.teamA && !newMatch.teamB) {
      return;
    }

    matches.push(newMatch);
  });

  return matches;
}

// export async function getMatchesFromScraped(
//   league: League,
//   file: string,
//   tricodeMapper: TricodeMapper,
//   streamMapperFn?: StreamMapperFunction,
// ): Promise<Match[]> {
//   const matches: Match[] = [];
//   const j: ScrapedMatch[] = JSON.parse(readFileSync(file).toString());
//   j.forEach((match: ScrapedMatch) => {
//     const startTime = new Date(match.datetime);
//     const state: MatchState = (new Date() > startTime) ? 'live' : 'upcoming';
//     const newMatch: Match = {
//       startTime: startTime,
//       league: league,
//       state: state,
//     };
//     if (match.team_a !== 'TBD') {
//       newMatch.teamA = {
//         name: match.team_a,
//         code: tricodeMapper[match.team_a] || match.team_a,
//       };
//       if (match.score_a !== '–') {
//         newMatch.teamA.result = {
//           mapWins: parseInt(match.score_a),
//         };
//       }
//     }

//     if (match.team_b !== 'TBD') {
//       newMatch.teamB = {
//         name: match.team_b,
//         code: tricodeMapper[match.team_b] || match.team_b,
//       };
//       if (match.score_b !== '–') {
//         newMatch.teamB.result = {
//           mapWins: parseInt(match.score_b),
//         };
//       }
//     }

//     if (state === 'live' && streamMapperFn !== undefined) {
//       // match is live
//       const stream = streamMapperFn(newMatch.teamA, newMatch.teamB);
//       if (stream) {
//         newMatch.stream = new URL(stream);
//       }
//     }

//     matches.push(newMatch);
//   });

//   return matches;
// }
