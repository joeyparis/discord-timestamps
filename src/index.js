import { Client, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { generateTimestamps } from './timestamps.js';

dotenv.config();

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('Missing DISCORD_TOKEN in .env file');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'timestamp') {
    const when = interaction.options.getString('when');
    const format = interaction.options.getString('format');
    const timezone = interaction.options.getString('timezone');
    const result = generateTimestamps({ when, format, timezone });

    await interaction.reply({
      content: result.content,
      ephemeral: true
    });
  }
});

client.login(token);
