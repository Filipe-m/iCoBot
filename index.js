import { Client, Events, GatewayIntentBits } from 'discord.js'
import express from 'express'
import * as dotenv from 'dotenv' 
dotenv.config()

//Express
const app = express()
const port = 3000

app.listen(port, () => {
  console.log(`Express listening on port ${port}`)
})

//Discord
const key = process.env.BOT_KEY
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
	console.log(`${c.user.tag} is online!`);
});

client.login(key);