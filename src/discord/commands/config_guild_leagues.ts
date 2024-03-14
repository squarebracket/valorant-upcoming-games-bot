import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { setLeagues } from "./lib/config_leagues.ts";
import { lastMsgPerGuild } from "./matches.ts";

export const data = new SlashCommandBuilder()
  .setName('config_guild_leagues')
  .setDescription('Set the default league filter for the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute = async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    return;
  }
  setLeagues(interaction, interaction.guildId);
  if (lastMsgPerGuild[interaction.guildId] && lastMsgPerGuild[interaction.guildId]['']) {
    delete lastMsgPerGuild[interaction.guildId][''];
  }
}
