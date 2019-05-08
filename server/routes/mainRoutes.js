const express = require('express')
//Create router
const router = express.Router()

//Global
const globalHandle = require('../libs/global/global')

//Setup uuid for csrf authentication
const uuid_middleware = require('../uuid_middleware')

//Get User model
const User = globalHandle.get('user')

//Get App
const app = globalHandle.get('app')

//Passport.js
const passport = require('passport')

app.use(passport.initialize())
app.use(passport.session())

var bcrypt = require('bcrypt');

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({usernameField: 'email',},
    function(email, password, done) {
      User.findOne({ where:{email} }).then(user => {
        if (!user || !user.verifyPassword(password)) { return done(null, false) }
        return done(null, user)
      }).catch(err => done(err))
    }
))

passport.serializeUser(function(user, done) {   
    done(null, user.id)
})
  
passport.deserializeUser(function(id, done) {
    User.findByPk(id)
    .then(user => done(null, user))
    .catch(done => console.log(done))
})

//Define main 'route' path

/**
 * Default GET '/' path
 */
router.get('/', (req, res) => {
    res.render('index')
})

/**
 * Register GET '/register' path
 * Register page
 */
router.get('/register', uuid_middleware.generate, (req, res) => {
    res.render('register', {layout: 'blank_layout'})
})

/**
 * Register POST '/register' path
 * Params: email, password
 */
router.post('/register', uuid_middleware.verify, (req, res) => {
    res.render('register', {layout: 'blank_layout'})
})

/**
 * Login GET '/login' path
 */
router.get('/login', uuid_middleware.generate, (req, res) => {
    res.render('login', {layout: 'blank_layout'})
})

/**
 * Login POST '/login' path
 * Params: email, password
 */
router.post('/login', uuid_middleware.verify, 
    passport.authenticate('local', { 
            successRedirect: '/',
            failureRedirect: '/login' 
    }))

/**
 * Logout GET '/logout' path, logout from session
 */
router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})



module.exports = router