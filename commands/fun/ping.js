const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong?'),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true
    })
    await interaction.editReply(
      `Pong?\nWebsocket ping: ${interaction.client.ws.ping}ms.\nAPI ping: ${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms`
    )
  }
}
