import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { outputLeagues } from "./lib/output_leagues.ts";

export const data = new SlashCommandBuilder()
  .setName('pleagues')
  .setDescription('Show all leagues, and which are enabled for your /pmatches');

export const execute = async function (interaction: ChatInputCommandInteraction) {
  if (interaction.user.id === null) {
    await interaction.reply({ content: `error: no user id...?` });
  }
  await interaction.deferReply({ ephemeral: true });
  // const leagues = await outputLeagues(interaction);
  // await interaction.followUp({ content: leagues, ephemeral: true });
  await interaction.followUp({ content: await outputLeagues(interaction.user.id), ephemeral: true });
}
