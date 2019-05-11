const expect = require('chai').expect
const nock = require('nock')

const user_test = require('./user_test')

//Database test suits

describe('Users', () => {
    it('Register user', (err) => {
      user_test.registerUser()
    })

    it('Read user')
    
    it('Update user')

    it('Delete user')
  });