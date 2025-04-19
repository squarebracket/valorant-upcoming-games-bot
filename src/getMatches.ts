
import { getFilterFuncForObjectIdOrDefault, League, LeagueFilterFunction } from "./lib/leagues.ts";
import { renderMatches } from './renderMatch.ts';
import { Match } from './lib/matches.ts';
import { getModules } from "./getModules.ts";

export async function getMatches(filter: string | null | undefined, objectId: string) {
  const start = new Date();
  const functionsByFile = await getModules();

  let filterFunc: LeagueFilterFunction;
  if (filter) {
    filterFunc = (league: League) => (new RegExp(filter, 'i')).test(league.name);
  } else {
    filterFunc = await getFilterFuncForObjectIdOrDefault(objectId);
  }

  let matches: Match[] = [];

  const functions = Object.values(functionsByFile).map(functionInfo => functionInfo.getMatches);
  for (const getMatches of functions) {
    const start = new Date();
    matches = matches.concat(await getMatches());
    console.log(getMatches.file, `${new Date().valueOf() - start.valueOf()}ms`);
  }

  let message = await renderMatches(matches, filterFunc);

  console.log(`getMatches took ${new Date().valueOf() - start.valueOf()}ms`);
  if (message.trim() === '') {
    return `I've got nothing for you :shruge:`;
  } else {
    return message.trim();
  }

}