import { ApplicationIntegrationType, InteractionContextType, REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env file');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName('timestamp')
    .setDescription('Generate Discord timestamp markdown')
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall
    )
    .setContexts(
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel
    )
    .addStringOption(option =>
      option
        .setName('when')
        .setDescription('Natural language time, e.g. "next Tuesday at 5pm"')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('timezone')
        .setDescription('Timezone (e.g. America/New_York, UTC)')
        .setRequired(false)
    )
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    let data;
    if (guildId) {
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`Successfully registered ${data.length} guild commands to guild ${guildId}.`);
    } else {
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`Successfully registered ${data.length} global application commands.`);
    }
  } catch (error) {
    console.error('Error registering commands:', error);
    process.exit(1);
  }
})();
