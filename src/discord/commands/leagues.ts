import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { outputLeagues } from "./lib/output_leagues.ts";

export const data = new SlashCommandBuilder()
  .setName('leagues')
  .setDescription('Returns leagues')

export const execute = async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: `error: no guild id...?` });
  }
  await interaction.deferReply({ ephemeral: true });
  // const leagues = await outputLeagues(interaction);
  // await interaction.followUp({ content: leagues, ephemeral: true });
  await interaction.followUp({ content: await outputLeagues(interaction.guildId!), ephemeral: true });
}
