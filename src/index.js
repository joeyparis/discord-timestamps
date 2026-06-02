import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import { generateTimestamps } from './timestamps.js';

dotenv.config();

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('Missing DISCORD_TOKEN in .env file');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const timezone_choices = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney'
];

const when_choices = [
  'today at 1pm',
  'tomorrow at 1pm',
  'next Tuesday at 5pm',
  'next Friday at 7pm',
  'in 3 hours',
  'in 30 minutes'
];

function getFilteredChoices(choices, focused_value) {
  const search_value = focused_value.toLowerCase();
  const filtered_choices = choices.filter(choice => choice.toLowerCase().includes(search_value));
  const visible_choices = filtered_choices.length > 0 ? filtered_choices : choices;

  return visible_choices.slice(0, 25).map(choice => ({
    name: choice,
    value: choice
  }));
}

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isAutocomplete() && interaction.commandName === 'timestamp') {
    const focused_option = interaction.options.getFocused(true);
    const focused_value = String(focused_option.value || '');

    if (focused_option.name === 'timezone') {
      await interaction.respond(getFilteredChoices(timezone_choices, focused_value));
      return;
    }

    if (focused_option.name === 'when') {
      await interaction.respond(getFilteredChoices(when_choices, focused_value));
      return;
    }

    await interaction.respond([]);
    return;
  }

  if (interaction.isChatInputCommand() && interaction.commandName === 'timestamp') {
    const timezoneOption = interaction.options.getString('timezone');
    const whenOption = interaction.options.getString('when');

    const result = generateTimestamps({
      timezone: timezoneOption,
      when: whenOption
    });

    await interaction.reply({
      content: result.content,
      ephemeral: true
    });
  }
});

client.login(token);
