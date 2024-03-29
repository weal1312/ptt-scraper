import { importx } from '@discordx/importer';
import { IntentsBitField } from 'discord.js';
import { Client } from 'discordx';

const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    // IntentsBitField.Flags.GuildMembers,
    // IntentsBitField.Flags.GuildMessages,
    // IntentsBitField.Flags.GuildMessageReactions,
    // IntentsBitField.Flags.GuildVoiceStates,
  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  // simpleCommand: {
  //   prefix: "!",
  // },
});

// The following syntax should be used in the ECMAScript environment
await importx(`${import.meta.dirname}/{events,commands}/**/*.{ts,js}`);

// Let's start the bot
if (!process.env.BOT_TOKEN) {
  throw Error('Could not find BOT_TOKEN in your environment');
}

// Log in with your bot token
await bot.login(process.env.BOT_TOKEN);
