const fs = require('node:fs')
const path = require('node:path')
const {
  Client,
  Events,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js')
const schedule = require('node-schedule')
const Users = require('./models/Users')
require('dotenv').config()
const SERVER_ID = process.env.SERVER_ID
const BOT_KEY = process.env.BOT_KEY
//Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember, Partials.User]
})

client.commands = new Collection()
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'))
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command)
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      )
    }
  }
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

//Node schedule run this function every X time to updating the members [https://www.npmjs.com/package/node-schedule]

//Adds users that are aldery in the server to the database
client.once(Events.ClientReady, () => {
  async function getMembers() {
    const guild = await client.guilds.fetch(SERVER_ID)
    const members = await guild.members.fetch()
    return members
  }
  let members = getMembers()
  members.then(members =>
    members.forEach(member => {
      Users.findOne({ where: { id: member.user.id } }).then(user => {
        //is in the database
        if (user != undefined) {
        }
        //is not in the database
        else {
          //ignore the bots
          if (!member.user.bot)
            Users.create({
              id: member.user.id,
              userName: member.user.username,
              lastDate: new Date()
            })
        }
      })
    })
  )
})

client.login(BOT_KEY)
