import { readdir, stat } from 'node:fs/promises';

import { getFilterFuncForObjectIdOrDefault, League, LeagueFilterFunction } from "./lib/leagues.ts";
import { renderMatches } from './renderMatch.ts';
import { Match } from './lib/matches.ts';

type AnnotatedFunction = Function & {
  file: string;
}

type FunctionInfo = {
  getMatches: AnnotatedFunction,
  mtime: number,
}

const functionsByFile: {[key: string]: FunctionInfo} = {};

async function getModules() {
  const start = new Date();
  const files = await readdir('./src/modules/enabled');
  for (const file of files) {
    const { mtimeMs } = await stat(`./src/modules/enabled/${file}`);
    console.log(`found module ${file} with mtime ${mtimeMs}`);
    if (functionsByFile[file] && functionsByFile[file].mtime === mtimeMs) {
      console.log(`  already imported and file not changed`);
      continue;
    } else if (!functionsByFile[file]) {
      console.log(`  new file`);
    } else if (mtimeMs > functionsByFile[file].mtime) {
      console.log(`  file has been modified`);
    } else {
      console.log(`  ?`);
    }
    const { getMatches } = await import(`./modules/enabled/${file}`);
    getMatches.file = file;
    functionsByFile[file] = {
      getMatches,
      mtime: mtimeMs,
    };
  }
  console.log(`getModules took ${new Date().valueOf() - start.valueOf()}ms`);
}

export async function getMatches(filter: string | null | undefined, objectId: string) {
  const start = new Date();
  await getModules();

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