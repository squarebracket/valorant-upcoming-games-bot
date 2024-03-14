import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { setLeagues } from "./lib/config_leagues.ts";
import { lastMsgPerPerson } from "./pmatches.ts";

export const data = new SlashCommandBuilder()
  .setName('config_personal_leagues')
  .setDescription('Set the default league filter for /pmatches');

export const execute = async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.user.id) {
    return;
  }
  setLeagues(interaction, interaction.user.id);
  if (lastMsgPerPerson[interaction.user.id]) {
    delete lastMsgPerPerson[interaction.user.id];
  }
}
