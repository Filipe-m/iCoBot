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
const WelcomeQuestions = require('./models/WelcomeQuestions')
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
  WelcomeQuestions.findOne({ where: { id: member.id } }).then(user => {
    if (user != undefined) {
    } else {
      sendWelcomeForm(member.id)
    }
  })
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
    content: 'Olá, bem vindo a iCoDev, poderia responder 4 perguntas rápidas?',
    components: [buttonRow]
  })
}

// Send form and listen to the response
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'confirm') {
      const modal = new ModalBuilder()
        .setCustomId('welcomeForm')
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

    if (interaction.customId === 'accept') {
      const modal = new ModalBuilder()
        .setCustomId('form')
        .setTitle('Formulário de avaliação')

      const objectives = new TextInputBuilder()
        .setCustomId('objectives')
        .setLabel('A iCoDev te auxiliou com seus objetivos?')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(255)
        .setRequired(false)

      const experience = new TextInputBuilder()
        .setCustomId('experience')
        .setLabel('Como foi sua experiência até o momento?')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(255)
        .setRequired(false)

      const improve = new TextInputBuilder()
        .setCustomId('improve')
        .setLabel('O que poderia melhorar a sua experiência?')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(255)
        .setRequired(false)

      const recommend = new TextInputBuilder()
        .setCustomId('recommend')
        .setLabel('De 0 a 10,quanto recomendaria para um amigo?')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(2)
        .setRequired(false)

      const firstActionRow = new ActionRowBuilder().addComponents(objectives)
      const secondActionRow = new ActionRowBuilder().addComponents(experience)
      const thirdActionRow = new ActionRowBuilder().addComponents(improve)
      const fourthActionRow = new ActionRowBuilder().addComponents(recommend)
      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow
      )

      await interaction.showModal(modal)
    }
    if (interaction.customId === 'deny') {
      const update = await interaction.update({
        content: 'Tudo bem, esperamos que esteja gostando do servidor!',
        components: []
      })
    }
  }

  if (interaction.type === InteractionType.ModalSubmit) {
    const response = interaction.fields
    if (interaction.customId === 'welcomeForm') {
      WelcomeQuestions.create({
        id: interaction.user.id,
        heardFrom: response.getTextInputValue('heardFrom'),
        objective: response.getTextInputValue('objective'),
        interest: response.getTextInputValue('interest'),
        dificulty: response.getTextInputValue('dificulty')
      })
      const update = await interaction.update({
        content: 'Obrigado pelas respostas! <a:check:1060266101482717355>',
        components: []
      })
    }
    if (interaction.customId === 'form') {
      
    }
  }
})

//Node schedule run this function every X time to updating the members [https://www.npmjs.com/package/node-schedule]
//Checks every 12:00 for a user that the last form was sent more than 1 hours ago, if yes reset the timer and send a form

const search = schedule.scheduleJob('28 * * * *', function () {
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
  const userID = id

  const user = await client.users.fetch(userID)

  const accept = new ButtonBuilder()
    .setCustomId('accept')
    .setStyle(ButtonStyle.Success)
    .setLabel('Sim')

  const deny = new ButtonBuilder()
    .setCustomId('deny')
    .setStyle(ButtonStyle.Danger)
    .setLabel('Não')

  const firstActionRow = new ActionRowBuilder().addComponents(accept, deny)
  const secondActionRow = new ActionRowBuilder().addComponents(deny)

  const message = await user.send({
    content:
      'Parece que você já está a um tempo nessa comunidade, poderia nos contar sua experiência?',
    components: [firstActionRow]
  })
}

client.login(BOT_KEY)
