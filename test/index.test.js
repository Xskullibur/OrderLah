const expect = require('chai').expect
const nock = require('nock')

const csrf_test = require('./csrf_test')

const user_test = require('./user_test')

const hostname = require('./host_test')


const supertest = require('supertest')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const request = supertest.agent(hostname)

//test suits

describe('Users', () => {
    let csrf = ''
    beforeEach(done => {
      csrf_test.getCSRFToken(request).then(res => {
        csrf = JSON.parse(res.text)[0]
        done()
      }).catch(err => done(err))
    })

    it('Register user (Good)', (done) => {
      //Request for token
      user_test.requestToken(request, 'orderlah.nyp@gmail.com')
      .then(res => {

        //get token
        user_test.retrieveToken(request)
        .then(token => {

          //Send request for creation of user account
          user_test.registerUser(request, {
            username: 'Johnny567',
            email: 'johnny123@gmail.com',
            fname:'Johnny',
            lname:'Tan', 
            dob:'1978-04-29',
            phone: '1234567890',
            password:'funnyguy101',
            code: token.body,
            csrf
          }).then(res=>{
              expect(res.text).to.equal('Success')
    
              done()
          }).catch(err => done(err))



        }).catch(err => done(err))
          

      })
      .catch(err => done(err))
      
      
    })

    it('Register user (Bad)', (done) => {
      //Request for token
      user_test.requestToken(request, 'orderlah.nyp@gmail.com')
      .then(res => {

        //get token
        user_test.retrieveToken(request)
        .then(token => {

          //Send request for creation of user account
          user_test.registerUser(request, {
            username: 'BABABA',
            email: 'sdsdasd',
            fname:'123123',
            lname:'123123123', 
            dob:'4444-04-29',
            phone: 'invalidphone',
            password:'heyinsecurepassword',
            code: token.body,
            csrf
          }).then(res=>{
              expect(res.text).to.equal('Failed')
    
              done()
          }).catch(err => done(err))



        }).catch(err => done(err))
          

      })
      .catch(err => done(err))
      
      
    })

    // it('Register user (Bad)', (err) => {
    //   user_test.registerUser('3434', '/;', 's', '1', '19999-34-12', 'sdsdsd')
    // })



    it('Login user (Bad)', (done) => {
      user_test.login(request, 'sdsdasd', 'funnyguy101')
      .then(res => {
        expect(res.headers.location).to.equal('/login?error=Incorrect%20Credientials!')
        done()
      })
      .catch(err => done(err))

    })

    it('Login user (Good)', (done) => {
      user_test.login(request, 'johnny123@gmail.com', 'funnyguy101')
      .then(res => {
        expect(res.headers.location).to.equal('/')
        done()
      })
      .catch(err => done(err))

    })


    it('Update user (Good)', (done) => {
      user_test.updateProfile(request, {
        email: 'johnny321@gmail.com',
        phone: '98765432',
        birthday: '2000-12-12',
        csrf
      }, './public/img/no-image.jpg').then(res => {
          expect(res.headers.location).to.equal('/profile')
          done()
      }).catch(err => done(err))
    })

    it('Update user (Bad)', (done) => {
      
      user_test.updateProfile(request, {
        email: 'johnny321@gmail.com',
        phone: '98765432',
        birthday: '2000-12-12',
        csrf
      }, './public/img/no-image.jpg')
      .then(res => {
          expect(res.text).to.equal('Failed')
          done()
      }).catch(err => done(err))
      
    })
    
  });

describe('Orders', () => {
  
})