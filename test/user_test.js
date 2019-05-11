const axios = require('axios')

const process = require('process')

const hostname = `http://${process.env.HOST}:${process.env.PORT}/`

module.exports = {
  registerUser(username) {
    return axios
      .post(`${hostname}/register`, {
        username
      })
      .then(res => res.data)
      .catch(error => console.log(error))
  }
};