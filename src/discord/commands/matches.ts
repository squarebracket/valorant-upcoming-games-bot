import { AutocompleteInteraction, ChatInputCommandInteraction, Message, SlashCommandBuilder } from "discord.js";
import { getMatches } from "../../getMatches.ts";
import { getLeagues, sortLeaguesFn } from "../../lib/leagues.ts";

export const lastMsgPerGuild: {
  [key: string]: {
    [key: string]: Message
  }
} = {};

export const data = new SlashCommandBuilder()
  .setName('matches')
  .setDescription('Returns live and upcoming matches')
	.addStringOption(option =>
		option.setName('filter')
			.setDescription('The string to filter leagues by (e.g. `americas` or `game changers emea`)')
      .setAutocomplete(true)
  );

export const execute = async function (interaction: ChatInputCommandInteraction) {
  const filter = interaction.options.getString('filter');
  const guildId = interaction.guildId;
  if (guildId === null || interaction.guildId === null) {
    return;
  }

  const cacheTimeout = new Date();
  // cacheTimeout.setHours(cacheTimeout.getHours() - 2);
  cacheTimeout.setHours(cacheTimeout.getHours());

  if (!lastMsgPerGuild[guildId]) {
    lastMsgPerGuild[guildId] = {};
  }
  if (lastMsgPerGuild[guildId][filter ?? ''] && lastMsgPerGuild[guildId][filter ?? ''].createdAt > cacheTimeout) {
    await interaction.reply({ content: `Check this recent message to avoid spamming: ${lastMsgPerGuild[guildId][filter ?? ''].url}`});
    return;
  }

  await interaction.deferReply();
  const message = await getMatches(filter, interaction.guildId);
  if (message.length < 2000) {
    lastMsgPerGuild[guildId][filter ?? ''] = await interaction.followUp({ content: message, fetchReply: true });
  } else {
    const split = message.split('\n');
    let current: string[] = [];
    let length = 0;
    let firstMessage = true;
    for (let i = 0; i < split.length; i++) {
      if (length + split[i].length > 2000) {
        const message = await interaction.followUp({ content: `${current.join('\n')}`, fetchReply: true });
        if (firstMessage) {
          lastMsgPerGuild[guildId][filter ?? ''] = message;
          firstMessage = false;
        }
        current = [split[i]];
        length = split[i].length + 1;
      } else {
        current.push(split[i]);
        length = length + split[i].length + 1;
      }
    }
    await interaction.followUp(`${current.join('\n')}`);
  }
}

export const autocomplete = async function(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused();
  const leagues = (await getLeagues()).sort(sortLeaguesFn).map(league => league.name);
  const filteredExact = leagues.filter(choice => new RegExp(`^${focusedValue}$`, 'i').test(choice));
  if (filteredExact.length === 1) {
    const choices = filteredExact.map(choice => ({name: choice, value: `^${choice}$`}));
    await interaction.respond(choices);
  } else {
    const filtered = leagues.filter(choice => new RegExp(`${focusedValue}`, 'i').test(choice));
    // need to anchor the value for a manually selected league, this is basically only
    // relevant when selecting Champions since it also matches Game Changers Championship
    const choices = filtered.map(choice => ({name: choice, value: `^${choice}$`}));
    // the first result should be what we enter, or 'All' if nothing was entered
    if (focusedValue !== '') {
      choices.unshift({name: focusedValue, value: focusedValue});
    } else {
      choices.unshift({name: 'All', value: '.*'});
    }
    await interaction.respond(choices.slice(0, 24));
  }
}