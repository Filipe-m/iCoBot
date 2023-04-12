const { REST, Routes } = require('discord.js');
require('dotenv').config()

const BOT_KEY = process.env.BOT_KEY
const BOT_ID = process.env.BOT_ID

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
];

const rest = new REST({ version: '10' }).setToken(BOT_KEY);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(BOT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();