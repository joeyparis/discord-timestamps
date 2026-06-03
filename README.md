# Discord Timestamp Bot

A simple Discord bot that turns natural language into copyable Discord timestamp markdown.

## Features

- `/timestamp` slash command with natural-language date parsing
- Ephemeral responses so generated timestamps stay private
- Copy-focused full date/time output: `<t:...:F>`
- Optional timezone autocomplete, defaulting to `America/New_York`
- Timezone-aware parsing using Luxon and chrono-node

## Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and give it a name
3. Navigate to **Bot** in the left sidebar
4. Click **Reset Token** and copy your bot token
5. No privileged gateway intents are required for this slash-command bot

### 2. Invite the Bot to Your Server

1. Go to **OAuth2 > URL Generator**
2. Under **Scopes**, select:
   - `bot`
   - `applications.commands`
3. Under **Bot Permissions**, select:
   - **Send Messages**
   - **Use Slash Commands**
4. Copy the generated URL, open it in your browser, and invite the bot to your server

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the values:
   - `DISCORD_TOKEN`: Your bot token from step 1
   - `CLIENT_ID`: Your application ID (found under **General Information**)
   - `GUILD_ID` (optional): Your server's ID for faster guild command registration

### 4. Install Dependencies

```bash
npm install
```

### 5. Register Commands

```bash
npm run register
```

If you provided a `GUILD_ID`, commands register instantly for that server.
Without `GUILD_ID`, commands are registered globally and may take up to an hour to appear.

### 6. Run the Bot

```bash
npm run start
```

## Usage

### Slash Command

Use `/timestamp` with a required `when` argument and an optional `timezone` argument. The fields do not use autocomplete suggestions, so pressing Enter will submit what you typed instead of selecting a suggestion.

```text
/timestamp when:tomorrow at 1pm
/timestamp when:next Tuesday at 5pm timezone:America/New_York
/timestamp when:in 3 hours
/timestamp when:July 11 at 8pm timezone:America/Los_Angeles
```

- **When**: Natural language time, such as `tomorrow at 1pm`, `next Tuesday at 5pm`, `in 3 hours`, or `July 11 at 8pm`
- **Timezone**: Optional IANA timezone, such as `America/New_York`, `America/Los_Angeles`, or `UTC`

If `timezone` is omitted, the bot assumes `America/New_York`.

Responses are ephemeral and only visible to the user who ran the command.

Discord renders timestamps in each viewer's own local timezone. The preview label shows which timezone the bot used when calculating the Unix timestamp.

## Example Output

```
Full date/time:
Copy this: `<t:1783814400:F>`
Preview (America/New_York): <t:1783814400:F>
```

## Common Timezones

| Timezone | Description |
|----------|-------------|
| `UTC` | Coordinated Universal Time |
| `America/New_York` | US Eastern Time |
| `America/Chicago` | US Central Time |
| `America/Denver` | US Mountain Time |
| `America/Los_Angeles` | US Pacific Time |
| `Europe/London` | UK Time |
| `Europe/Paris` | Central European Time |
| `Asia/Tokyo` | Japan Standard Time |
| `Australia/Sydney` | Australian Eastern Time |

You can find a full list of IANA timezones [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Discord Timestamp Format

| Flag | Format | Example |
|------|--------|---------|
| `F` | Full date/time | `Saturday, July 11, 2026 at 8:00 PM` |

## Project Structure

```
.
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment variable template
├── .gitignore           # Local files ignored by git
├── LICENSE              # MIT license
├── package.json         # Project dependencies and scripts
├── package-lock.json    # Locked dependency versions
├── README.md            # This file
└── src/
    ├── index.js         # Bot runtime - handles interactions
    ├── register-commands.js # Command registration script
    ├── timestamps.js    # Timestamp generation logic
    └── timestamps.test.js # Unit tests
```

## License

MIT
