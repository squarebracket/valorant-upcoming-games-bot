import { getLeagues, getFilterFuncForObjectIdOrDefault, sortLeaguesFn } from "../../../lib/leagues.ts";

export async function outputLeagues(objectId: string) {
  // async function outputLeagues(interaction: ChatInputCommandInteraction) {
    let messages = ['Known leagues (✅ = displayed by default, ❌ = hidden by default)'];
    const leagues = await getLeagues();
    const filterFunc = await getFilterFuncForObjectIdOrDefault(objectId);
    leagues.sort(sortLeaguesFn).forEach((league) => {
      let msg = (filterFunc(league) ? `✅` : `❌`) + (league.emoji ? league.emoji.toString() : '') + league.name;
      // let msg = league.name;
      // if (filterFunc(league)) {
        // msg += ' (included in `/matches` by default)';
      // }
      messages.push(msg);
    });
    return messages.join('\n').slice(0,1999);
  }