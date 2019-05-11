const process = require('process')

const hostname = `http://${process.env.HOST}:${process.env.PORT}`

module.exports = hostname