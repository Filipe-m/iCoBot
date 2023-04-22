const Sequelize = require('sequelize')
require('dotenv').config()
const DATABASE_USER = process.env.DATABASE_USER
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD

const sequelize = new Sequelize('database', DATABASE_USER, DATABASE_PASSWORD, {
  host: 'localhost',
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
})

module.exports = sequelize
