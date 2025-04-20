import { StreamMapperFunction, TricodeMapper, doRequest, CacheOptions } from "../lib/utils.ts";
import { League } from "../lib/leagues.ts";
import { Match } from "../lib/matches.ts";
import * as config from '../config.ts';

type LiquipediaMatchTeam = {
  id: number,
  type: 'team',
  name: string,
  icon: string,
  score: number,
  status: string,
  teamtemplate: {
    name: string,
    shortname: string,
    imageurl: string,
  }
}

type LiquipediaMatch = {
  pageid: number,
  pagename: string,
  match2id: string,
  match2bracketid: string,
  winner: string, // number in a string
  finished: number, // number as bool
  section: string,
  date: string, // datetime in string as format YYYY-MM-DD HH:mm:SS
  dateexact: number,
  stream: {[key: string]: string},
  links: string[], // ?
  tournament: string,
  extradata: {
    timestamp: number,
    timezoneoffset: string,
    timezoneid: string,
  },
  match2opponents: LiquipediaMatchTeam[],
  bestof: number,
}

type LeagueMapper = (tourney: string) => League;


export async function getLiquipedia(
  tournament: string | string[], // array means collect several tournaments together
  leagueMapper: LeagueMapper,
  tricodeMapper?: TricodeMapper,
  streamMapperFn?: StreamMapperFunction,
): Promise<Match[]> {
  const apiKey = config['liquipediaApiKey'];
  const headers = {
    authorization: `Apikey ${apiKey}`
  };
  const tournaments = Array.isArray(tournament) ? tournament : [tournament];
  const conditions = tournaments.map(t => `[[tournament::${encodeURIComponent(t)}]]`).join(`%20OR%20`);
  const url = new URL(`https://api.liquipedia.net/api/v3/match?wiki=valorant&limit=200&conditions=${conditions}&streamurls=true&rawstreams=true&order=date%20ASC`);
  const cacheOptions: CacheOptions = {
    key: conditions,
    time: 180,
  }
  const matches: LiquipediaMatch[] = (await doRequest(url, { headers, cache: cacheOptions })).result;
  const newMatches: Match[] = [];

  matches.forEach((match) => {
    if (match.finished) {
      return;
    }
    const startTime = new Date(match.extradata.timestamp * 1000);
    const league = leagueMapper(match.tournament);
    const newMatch: Match = {
      league: league,
      state: startTime > new Date() ? 'upcoming' : 'live',
      startTime: startTime,
    };

    // sometimes there will be team info data in liquipedia that is not an actual
    // team, but is information for the tournament format (something like "highest seed").
    // checking if there's a teamtemplate should guard against all conditions here.
    if (match.match2opponents[0] && match.match2opponents[0].name !== '' && match.match2opponents[0].teamtemplate) {
      newMatch.teamA = {
        name: match.match2opponents[0].name,
        code: match.match2opponents[0].teamtemplate.shortname,
        result: {
          mapWins: match.match2opponents[0].score,
        }
      }
    }

    if (match.match2opponents[1] && match.match2opponents[1].name !== '' && match.match2opponents[1].teamtemplate) {
      newMatch.teamB = {
        name: match.match2opponents[1].name,
        code: match.match2opponents[1].teamtemplate.shortname,
        result: {
          mapWins: match.match2opponents[1].score,
        }
      }
    }

    if (match.bestof) {
      newMatch.strategy = {
        type: "bestOf",
        count: match.bestof,
      }
    }

    if (match.stream) {
      if (match.stream["twitch_en_1"]) {
        newMatch.stream = new URL(match.stream["twitch_en_1"]);
      } else if (match.stream["twitch"]) {
        newMatch.stream = new URL(match.stream["twitch"]);
      } else if (match.stream['bilibili']) {
        newMatch.stream = new URL(match.stream['bilibili']);
      } else if (match.stream['douyu']) {
        newMatch.stream = new URL(match.stream['douyu']);
      } else if (match.stream['huya']) {
        newMatch.stream = new URL(match.stream['huya']);
      }
    }

    newMatches.push(newMatch);
  });
  return newMatches;
}