const express = require('express')
//Create router
const router = express.Router()

//Global
const globalHandle = require('../libs/global/global')

//Setup uuid for csrf authentication
const uuid_middleware = require('../libs/uuid_middleware')

//Login authentication middleware
const auth_login = require('../libs/auth_login')

const MenuItem = globalHandle.get('menuItem')

//Get User model
const User = globalHandle.get('user')

//Get App
const app = globalHandle.get('app')

//Passport.js
const passport = require('passport')

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    //Set the user to local for handlebars to access
    if(req.user != undefined)res.locals.user = req.user
    next()
})

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
router.get('/', auth_login.auth, (req, res) => {
    res.render('index')
})

router.get('/menuItem', auth_login.auth, (req, res) => {
   MenuItem.findAll({}).then( menuItems => {
       res.send(JSON.stringify(menuItems))
   })
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
    
    //Create the user account
    User.create({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.fname,
        lastName: req.body.lname,
        birthday: req.body.dob,
        phone: req.body.phone,
        password: req.body.password
    }).then(user => {
        console.log("User's auto-generated ID:", user.id);
        res.send('Success')
    }).catch(err => {
        console.log(err)
        res.status(400)//Bad request
        res.send('Failed')
    })

    
})

/**
 * Login GET '/login' path
 */
router.get('/login', (req, res) => {
    User.create({
        username: "Administrator",
        email: "admin@gmail.com",
        firstName: "lee",
        lastName: "hsienxiang",
        birthday: "2019-05-01",
        phone: "13623232",
        password: "password",
        role : "admin"
    })
    User.create({
        username: "Yummy Steak",
        email: "ys@gmail.com",
        firstName: "Anna",
        lastName: "Tan",
        birthday: "2019-05-11",
        phone: "13623232",
        password: "password",
        role : "Stallowner"
    })
    User.create({
        username: "John Wick",
        email: "jw@gmail.com",
        firstName: "John",
        lastName: "Wick",
        birthday: "2019-05-21",
        phone: "13623232",
        password: "password",
        role : "Customer"
    })
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

/**
 * Logout GET '/logout' path, logout from session
 */
router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})


module.exports = router