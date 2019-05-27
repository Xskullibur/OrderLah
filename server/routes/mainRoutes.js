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
const OrderItem = globalHandle.get('orderItem')
const Order = globalHandle.get('order')

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
router.get('/', auth_login.auth, (req, res) => {
    res.render('index', {size: MenuItem.count()})
})

/**
 * Get all menu items inside the database as JSON
 */
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

router.get('/getRatingData', (req, res) =>{

    const db = globalHandle.get('db');
    let rating_matrix = [];

    User.findAll().then(users=>{
        users.forEach(user => {
            rating_matrix[user.id] = []
        });
        res.send(rating_matrix)
    })
})

module.exports = router