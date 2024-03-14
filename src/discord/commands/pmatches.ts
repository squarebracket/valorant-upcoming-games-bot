import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from "discord.js";
import { getMatches } from "../../getMatches.ts";

export const lastMsgPerPerson: {
  [key: string]: Message
} = {};

export const data = new SlashCommandBuilder()
  .setName('pmatches')
  .setDescription('Returns matches using your personal leagues filter');

export const execute = async function (interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  if (userId === null) {
    return;
  }
  const cacheTimeout = new Date();
  cacheTimeout.setHours(cacheTimeout.getHours() - 2);

  if (lastMsgPerPerson[userId] && lastMsgPerPerson[userId].createdAt > cacheTimeout) {
    await interaction.reply({ content: `Check this recent message to avoid spamming: ${lastMsgPerPerson[userId].url}`});
    return;
  }

  await interaction.deferReply();
  const message = await getMatches(undefined, interaction.user.id);
  if (message.length < 2000) {
    lastMsgPerPerson[userId] = await interaction.followUp({ content: message, fetchReply: true });
  } else {
    // await interaction.editReply(message.slice(0,1999));
    // return;
    const split = message.split('\n');
    let current: string[] = [];
    let length = 0;
    let firstMessage = true;
    for (let i = 0; i < split.length; i++) {
      if (length + split[i].length > 2000) {
        const message = await interaction.followUp({ content: `${current.join('\n')}`, fetchReply: true });
        if (firstMessage) {
          lastMsgPerPerson[userId] = message;
          firstMessage = false;
        }
        current = [split[i]];
        length = split[i].length + 1;
      } else {
        current.push(split[i]);
        length = length + split[i].length + 1;
      }
    }
    await interaction.followUp({ content: current.join('\n'), fetchReply: true });
  }
}