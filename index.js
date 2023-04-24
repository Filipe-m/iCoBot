const fs = require('node:fs')
const path = require('node:path')
const { Op } = require('sequelize')
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  StringSelectMenuBuilder
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

//Adds users that are aldery in the server to the database
/* client.once(Events.ClientReady, () => {
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
}) */

//Node schedule run this function every X time to updating the members [https://www.npmjs.com/package/node-schedule]

const search = schedule.scheduleJob('* 12 * * *', function () {
  const oneHourAgo = new Date()
  oneHourAgo.setHours(oneHourAgo.getHours() - 1)

  Users.findAll({
    where: {
      lastDate: {
        [Op.lt]: oneHourAgo
      }
    }
  })
    .then(users => {
      users.forEach(user => {
        Users.update({ lastDate: new Date() }, { where: { id: user.id } })
        sendForm(user.id)
      })
    })
    .catch(err => {
      console.log(err)
    })
})

async function sendForm(id) {
  const options = [
    {
      label: 'Muito bom',
      value: '5'
    },
    {
      label: 'Bom',
      value: '4'
    },
    {
      label: 'Mediano',
      value: '3'
    },
    {
      label: 'Ruim',
      value: '2'
    },
    {
      label: 'Muito ruim',
      value: '1'
    }
  ]
  const userID = id

  const user = await client.users.fetch(userID)

  const server = new StringSelectMenuBuilder()
    .setCustomId('server')
    .setPlaceholder('Como você avaliaria o servidor?')
    .addOptions(options)

  const learning = new StringSelectMenuBuilder()
    .setCustomId('learning')
    .setPlaceholder('Como você avaliaria seu aprendizado?')
    .addOptions(options)

  const serverRow = new ActionRowBuilder().addComponents(server)
  const learningRow = new ActionRowBuilder().addComponents(learning)

  //Send to Dm
  const message = await user.send({
    content: 'Faça avaliações sobre a sua experiência dentro da comunidade',
    components: [serverRow, learningRow]
  })

  const collector = message.createMessageComponentCollector({
    filter: i => i.user.id === userID,
    time: 6000
  })

  collector.on('collect', interaction => {
    if (interaction.customId === 'server') {
      selectedOption1 = interaction.values[0]
      server.setDisabled(true)
    }

    if (interaction.customId === 'learning') {
      selectedOption2 = interaction.values[0]
      learning.setDisabled(true)
    }

    interaction.update({ components: [serverRow, learningRow] })
  })

  collector.on('end', () => {
    collector.collected.forEach(i => {
      console.log(`Tipo: ${i.customId}, valor:${i.values[0]}`) // return the value of the options
    })
  })
}

client.login(BOT_KEY)
