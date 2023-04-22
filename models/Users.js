const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const Users = sequelize.define('users', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  userName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  lastDate: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  }
})

module.exports = Users
