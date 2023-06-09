const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const WelcomeQuestions = sequelize.define('welcomeQuestions', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  heardFrom: {
    type: Sequelize.STRING,
    allowNull: false
  },
  objective: {
    type: Sequelize.STRING,
    allowNull: true
  },
  interest: {
    type: Sequelize.STRING,
    allowNull: true
  },
  dificulty: {
    type: Sequelize.STRING,
    allowNull: true
  }
})

module.exports = WelcomeQuestions
