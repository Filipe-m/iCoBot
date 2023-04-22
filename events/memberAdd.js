const { Events } = require('discord.js')
const Users = require('../models/Users')

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    Users.create({
      id: member.id,
      userName: member.displayName,
      lastDate: new Date()
    })
  }
}
