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
  const url = new URL(`https://www.thespike.gg/events/matches/a/${tourneyId}`);
  const html = await doRequest(url, false);
  const root = parse(html);
  const divs = root.querySelectorAll('div[class^="event_match__"]');
  divs.forEach(matchEl => {
    try {
      const link = matchEl.querySelector('a');
      const date = link.querySelector('div[class^="event_timeDetails__"]').firstChild.innerText.trim();
      let time: string;
      if (date !== 'Live') {
        time = link.querySelector('div[class^="event_timeDetails__"]').childNodes[1].innerText.trim();
      }
      console.log(date, time);
      const startTime = date === 'Live' ? new Date() : new Date(`${date} ${time} Z`);

      const a = link.querySelector('div[class^="event_teamOne__"]');
      const teamA = a.querySelector('span[class^="event_teamTitle__"]').innerText.trim();
      let scoreA: string;
      const scoreAEl = a.querySelector('div[class*="event_score__"]');
      if (scoreAEl) {
        scoreA = scoreAEl.innerText.trim();
      }
      const b = link.querySelector('div[class^="event_teamTwo__"]');
      const teamB = b.querySelector('span[class^="event_teamTitle__"]').innerText.trim();
      let scoreB: string;
      const scoreBEl = b.querySelector('div[class*="event_score__"]');
      if (scoreBEl) {
        scoreB = scoreBEl.innerText.trim();
      }
      console.log({
        startTime,
        teamA,
        teamB,
        scoreA,
        scoreB,
      });
      scraped.push({
        startTime,
        teamA,
        teamB,
        scoreA,
        scoreB,
      });
    } catch (e) {
      console.error(`problem scraping ${url}: ${e}: ${matchEl}`);
    }
  });
  return scraped;
}


export async function getMatchesFromSpike(
  league: League,
  tourneyId: number,
  tricodeMapper: TricodeMapper,
  streamMapperFn?: StreamMapperFunction,
): Promise<Match[]> {
  const matches: Match[] = [];
  const scraped = await scraper(tourneyId);
  scraped.forEach((match) => {
    const state: MatchState = (new Date() >= match.startTime) ? 'live' : 'upcoming';
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

    matches.push(newMatch);
  });

  return matches;
}
