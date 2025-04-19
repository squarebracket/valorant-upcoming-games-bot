import { readdir, stat } from 'node:fs/promises';

export type AnnotatedFunction = Function & {
  file: string;
}

export type FunctionInfo = {
  getMatches: AnnotatedFunction,
  mtime: number,
}

const functionsByFile: {[key: string]: FunctionInfo} = {};

export async function getModules() {
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
  return functionsByFile;
}