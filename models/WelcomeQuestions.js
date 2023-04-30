const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const WelcomeQuestions = sequelize.define('welcomeQuestions', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  heardFrom: {
    type: Sequelize.STRING,
    allowNull: false
  },
  objective: {
    type: Sequelize.STRING,
    defaultValue: Sequelize.NOW,
    allowNull: true
  },
  interest: {
    type: Sequelize.STRING,
    defaultValue: Sequelize.NOW,
    allowNull: true
  },
  dificulty: {
    type: Sequelize.STRING,
    defaultValue: Sequelize.NOW,
    allowNull: true
  }
})

module.exports = WelcomeQuestions
