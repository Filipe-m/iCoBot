const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Quer saber mais sobre que Bot eu sou?'),
  async execute(interaction) {
    const time = new Date()
    const embed = new EmbedBuilder()
      .setColor(0x52a02f)
      .setTitle('Sobre mim')
      .setDescription(
        'Sou um Bot no Discord feito para auxiliar a comunidade da iCoDev e seus membros a atingir o melhor de seu potencial! Caso possua alguma duvida sugestão ou problema comunicar os moderadores do servidor'
      )
      .addFields({
        name: 'Meu código se encontra em:',
        value: 'https://github.com/Filipe-m/iCoBot',
        inline: true
      })
      .setAuthor({
        name: 'IcoBot',
        iconURL:
          'https://cdn.discordapp.com/attachments/743511889945821196/1103444847077101589/Logo_iCoDev_Florestal.png.png'
      })
      .setFooter({
        text: `${time}`,
        iconURL:
          'https://www.imagensempng.com.br/wp-content/uploads/2021/09/Icone-relogio-Png.png'
      })

    const sent = await interaction.reply({ embeds: [embed] })
  }
}
