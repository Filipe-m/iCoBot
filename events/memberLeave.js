const { Events } = require('discord.js')
const Users = require('../models/Users')

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    Users.destroy({
      where: {
        id: member.id
      }
    })
  }
}
