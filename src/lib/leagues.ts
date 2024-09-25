import { Config } from "./storage.ts";
import { doRequest } from "./utils.ts";
import { getClient } from "./client.ts";
import { GuildEmoji } from "discord.js";

type Tournament = {
  season: {
    name: string;
  }
}

export type League = {
  id: string;
  name: string;
  slug: string;
  region?:
  "BRAZIL" |
  "CHINA" |
  "EMEA" |
  "INTERNATIONAL" |
  "JAPAN" |
  "KOREA" |
  "LATIN AMERICA" |
  "LATIN AMERICA NORTH" |
  "LATIN AMERICA SOUTH" |
  "NORTH AMERICA" |
  "OCEANIA" |
  "SOUTHEAST ASIA" |
  "VIETNAM";
  tournaments: Tournament[];
  image?: string;
  emoji?: GuildEmoji | string;
}

// note: china has region === 'china' but the other ILs
// have region === 'INTERNATIONAL'
export const defaultFilter = (league: League): boolean => {
  return league.name.includes('Game Changers') || (league.region === 'INTERNATIONAL' && league.name !== 'Challengers South Asia')
    || league.region === 'NORTH AMERICA' || league.region === 'CHINA';
};

let _leagues: League[] = [];
export async function getLeagues(): Promise<League[]> {
  if (_leagues.length) {
    return _leagues;
  } else {
    const client = getClient();

    _leagues = (await doRequest(new URL('https://esports-api.service.valorantesports.com/persisted/val/getLeaguesForStandings?hl=en-US&sport=val')))
      .data.leagues
      .filter((league: League) => !league.name.includes('Last Chance Qualifier') && !league.name.includes('LOCK//IN') && !league.name.includes('Regional League CIS'))
      // .filter((league: League) => parseInt(league.tournaments[0].season.name) >= new Date().getFullYear())
      .map((league: League) => {
        let emoji: GuildEmoji | string | undefined = client.emojis.cache.find(e => e.name === league.slug);
        if (!emoji && /game_changers/.test(league.slug)) {
          emoji = client.emojis.cache.find(e => e.name === 'game_changers');
        } else if (!emoji && (/challengers_kr/.test(league.slug))) {
          emoji = ':flag_kr:';
        } else if (!emoji && (/challengers_jpn/.test(league.slug))) {
          emoji = ':flag_jp:';
        } else if (!emoji && (/challengers_sea_([a-z][a-z])/.test(league.slug))) {
          emoji = `:flag_${RegExp.$1}:`;
        } else if (!emoji && (/challengers|ascension/.test(league.slug) || league.slug === 'valorant_oceania_tour')) {
          emoji = client.emojis.cache.find(e => e.name === 'challengers');
        }
        return {
          id: league.id,
          name: league.name,
          region: league.region,
          slug: league.slug,
          emoji: emoji,
        }
      })

    _leagues.push({
      id: 'a',
      name: 'Game Changers OCE',
      region: 'OCEANIA',
      slug: 'game-changers-oce',
      tournaments: [],
      emoji: client.emojis.cache.find(e => e.name === 'game_changers'),
    });

    return _leagues;
  }
}

export type LeagueFilterFunction = (league: League) => boolean;

export async function filterLeagues(filterFunction: LeagueFilterFunction): Promise<League[]> {
  return (await getLeagues()).filter(filterFunction);
}

export async function getLeagueByName(name: string): Promise<League | undefined> {
  return (await getLeagues()).find((league) => league.name === name);
}

export async function getFilterFuncForObjectIdOrDefault(objectId: string): Promise<LeagueFilterFunction> {
  const config = await Config.findOne({ where: { objectId: objectId } });
  if (config) {
    // @ts-ignore
    const includedLeagues = config.get('mainLeagueIds').concat(config.get('chalLeagueIds'));
    return (league: League) => includedLeagues.includes(league.id);
  } else {
    return defaultFilter;
  }
}

export function sortLeaguesFn(one: League, two: League): number {
  if (/vct|^champions$|masters/i.test(one.name)) {
    return -1;
  } else if (/challengers/i.test(one.name) && /game changers/i.test(two.name)) {
    return -1;
  } else if (/game changers/i.test(one.name) && /challengers/i.test(two.name)) {
    return 1;
  }
  return 0;
}
