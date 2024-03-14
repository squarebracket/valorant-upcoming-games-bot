import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChatInputCommandInteraction, ComponentType } from "discord.js";
import { League, getLeagues } from "../../../lib/leagues.ts";
import { Config } from "../../../lib/storage.ts";


async function main() {
  return (await getLeagues())
    .filter((league) => !league.name.includes('Challengers') || league.name.includes('Ascension'))
    .map(league => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(league.name)
        .setValue(league.id)
    });
}

async function challengers() {
  return (await getLeagues())
    .filter((league) => league.name.includes('Challengers') && !league.name.includes('Ascension'))
    .map(league => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(league.name)
        .setValue(league.id)
    });
}


export async function setLeagues(interaction: ChatInputCommandInteraction, objectId: string | null) {
  if (objectId === null) {
    await interaction.reply({ content: `Error` })
  }
  const mainOptions = (await main());
  const selectMain = new StringSelectMenuBuilder()
    .setCustomId('main-leagues')
    .setPlaceholder('Main/GC leagues')
    .addOptions(mainOptions)
    .setMinValues(1)
    .setMaxValues(mainOptions.length);
  const mainRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMain);

  const chalOptions = (await challengers());
  const selectChal = new StringSelectMenuBuilder()
    .setCustomId('chal-leagues')
    .setPlaceholder('Challengers leagues')
    .addOptions(chalOptions)
    .setMinValues(1)
    .setMaxValues(chalOptions.length);
  const chalRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectChal);

  const response = await interaction.reply({
    content: 'Choose leagues to return by default',
    components: [mainRow, chalRow],
    ephemeral: true,
  });

  const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
  // const mainFilter = i => i.customId === 'main-leagues';
  collector.on('collect', async i => {
    const selection = i.values;
    if (i.customId === 'main-leagues') {
      const affectedRows = Config.upsert({ objectId: objectId, mainLeagueIds: i.values });
    } else if (i.customId === 'chal-leagues') {
      const affectedRows = Config.upsert({ objectId: objectId, chalLeagueIds: i.values });
    }
    await i.reply({ content: `configuration changed`, ephemeral: true });
  });
}