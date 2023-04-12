const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Deseja a foto de perfil de alguem ou a sua?')
    .addUserOption(option =>
      option.setName('alvo').setDescription('Usuario do qual deseja ver')
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('alvo')
    //If a user is selected return the info of this user
    if (user) {
      return interaction.reply({
        embeds: [
          {
            color: 0x2957d8,
            title: `${user.username}`,
            image: {
              url: `${user.displayAvatarURL({ dynamic: true })}`
            }
          }
        ]
      })
    }
    //If not return your own
    return interaction.reply({
      embeds: [
        {
          color: 0x2957d8,
          title: `${interaction.user.username}`,
          image: {
            url: `${interaction.user.displayAvatarURL()}`
          }
        }
      ]
    })
  }
}
