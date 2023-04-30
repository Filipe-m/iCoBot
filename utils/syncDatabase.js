const Users = require('../models/Users.js')
const WelcomeQuestions = require('../models/WelcomeQuestions.js')

//Users.sync({ force: true }) //erase all the database
WelcomeQuestions.sync({ force: true })
// something.sync({alter: true}) //only add what changed on top of the original database
