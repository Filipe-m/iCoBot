const fs = require('node:fs')
const path = require('node:path')
const { Op } = require('sequelize')
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events,
  ButtonBuilder,
  ButtonStyle,
  InteractionType
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

//send request to send form
client.on(Events.GuildMemberAdd, member => {
  sendWelcomeForm(member.id)
})

async function sendWelcomeForm(id) {
  const userID = id

  const user = await client.users.fetch(userID)

  const button = new ButtonBuilder()
    .setCustomId('confirm')
    .setStyle(ButtonStyle.Success)
    .setLabel('Clique para responder')

  const buttonRow = new ActionRowBuilder().addComponents(button)

  const message = await user.send({
    components: [buttonRow]
  })
}

// Send form and listen to the response
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'confirm') {
      const modal = new ModalBuilder()
        .setCustomId('welcome')
        .setTitle('Bem vindos, responde o seguinte questionário')

      const heardFrom = new TextInputBuilder()
        .setCustomId('heardFrom')
        .setLabel('Onde você ouviu falar da iCoDev?')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(255)
        .setRequired(true)

      const objective = new TextInputBuilder()
        .setCustomId('objective')
        .setLabel('Qual seu objetivo em participar da iCoDev?')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(255)
        .setRequired(false)

      const interest = new TextInputBuilder()
        .setCustomId('interest')
        .setLabel('O que fez você se interessar pela iCoDev?')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(255)
        .setRequired(false)

      const dificulty = new TextInputBuilder()
        .setCustomId('dificulty')
        .setLabel('Você possui dificuldades no seu aprendizado?')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(255)
        .setRequired(false)

      const firstActionRow = new ActionRowBuilder().addComponents(heardFrom)
      const secondActionRow = new ActionRowBuilder().addComponents(objective)
      const thirdActionRow = new ActionRowBuilder().addComponents(interest)
      const fourthActionRow = new ActionRowBuilder().addComponents(dificulty)
      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow
      )

      await interaction.showModal(modal)
    }
  }

  if (interaction.type === InteractionType.ModalSubmit) {
    console.log(interaction)
    const response = interaction.fields
    console.log(interaction.user.id)
    console.log(response.getTextInputValue('objective'))
    const update = await interaction.update({
      content: 'Obrigado pelas respostas! <a:check:1060266101482717355>',
      components: []
    })
  }
})

//Node schedule run this function every X time to updating the members [https://www.npmjs.com/package/node-schedule]
//Checks every 12:00 for a user that the last form was sent more than 1 hours ago, if yes reset the timer and send a form

const search = schedule.scheduleJob('2 * * * *', function () {
  const oneMinuteAgo = new Date()
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)

  Users.findAll({
    where: {
      lastDate: {
        [Op.lt]: oneMinuteAgo
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

//Send the form with the question in the DM of the user
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
    time: 15000
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
      //console.log(`Tipo: ${i.customId}, valor:${i.values[0]}`) // return the value of the options
      console.log(i)
    })
  })
}

client.login(BOT_KEY)
