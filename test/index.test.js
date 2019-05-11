const expect = require('chai').expect
const nock = require('nock')

const csrf_test = require('./csrf_test')

const user_test = require('./user_test')

const hostname = require('./host_test')


const supertest = require('supertest')

const request = supertest.agent(hostname)

//test suits

describe('Users', () => {
    let csrf = ''
    beforeEach(done => {
      csrf_test.getCSRFToken(request).then(res => {
        csrf = res.text
        done()
      }).catch(err => done(err))
    })

    it('Register user (Good)', (done) => {
      user_test.registerUser(request, {
        username: 'Johnny567',
        email: 'johnny123@gmail.com',
        fname:'Johnny',
        lname:'Tan', 
        dob:'1978-04-29',
        phone: '1234567890',
        password:'funnyguy101', 
        csrf
      }).then(res=>{
          expect(res.text).to.equal('Success')

          done()
      }).catch(err => done(err))
      
    })

    // it('Register user (Bad)', (err) => {
    //   user_test.registerUser('3434', '/;', 's', '1', '19999-34-12', 'sdsdsd')
    // })


    it('Login user (Good)', (done) => {
      user_test.login(request, 'johnny123@gmail.com', 'funnyguy101')
      .then(res => {
        done()
      }).catch(err => done(err))
    })
    
    it('Update user')

    it('Delete user')
  });