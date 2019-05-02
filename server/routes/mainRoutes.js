const express = require('express')
//Create router
const router = express.Router()

//Global
const globalHandle = require('../libs/global/global')

//Get User model
const User = globalHandle.get('user')


//Passport.js
const passport = require('passport')

router.use(passport.initialize())
router.use(passport.session())

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({usernameField: 'email',},
    function(email, password, done) {
      User.findOne({ email }, function (err, user) {
        if (err) { return done(err) }
        if (!user || !user.verifyPassword(password)) { return done(null, false) }
        return done(null, user)
      })
    }
))

passport.serializeUser(function(user, done) {
    done(null, user.id)
})
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user)
    })
})

//Define main 'route' path

/**
 * Default GET '/' path
 */
router.get('/', (req, res) => {
    res.render('index')
})

/**
 * Login GET '/login' path
 */
router.get('/login', (req, res) => {
    res.render('login', {layout: 'blank_layout'})
})

/**
 * Login POST '/login' path
 * Params: email, password
 */
router.post('/login',  
    passport.authenticate('local', { 
            successRedirect: '/',
            failureRedirect: '/login' 
    }))


module.exports = router