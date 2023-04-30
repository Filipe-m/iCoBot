const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const Questions = sequelize.define('questions', {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  objectives: {
    type: Sequelize.STRING,
    allowNull: true
  },
  experience: {
    type: Sequelize.STRING,
    allowNull: true
  },
  improve: {
    type: Sequelize.STRING,
    allowNull: true
  },
  liked: {
    type: Sequelize.STRING,
    allowNull: true
  },
  recommend: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
})

module.exports = Questions
