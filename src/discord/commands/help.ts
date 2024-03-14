import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Describes how to use the commands for this bot')

const help = `
To get the list of matches do \`/matches\`. If you want results for only specific leagues, you can include the \`filter\` parameter. The parameter has autocompletion (including \`All\` which simply returns everything) based on what you type in, but you can also provide a simple string like \`game changers\` or a regex like \`vct .*\` and it will return all matching leagues.

If you're not sure what leagues exist, you can use the \`/leagues\` command. It will also tell you what leagues are included in the output of \`/matches\` by default. The defaults are set by the discord server admin.

If the server-set defaults aren't to your liking, you can use \`/config_personal_leagues\` to set a filter you'd prefer and use \`/pmatches\` instead. The config menu selection is a bit scuffed, but it works.`;

export const execute = async function (interaction: ChatInputCommandInteraction) {
  await interaction.reply({ content: help, ephemeral: true })
}
