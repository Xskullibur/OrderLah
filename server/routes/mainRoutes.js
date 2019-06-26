const express = require('express')
//Create router
const router = express.Router()

//Global
const globalHandle = require('../libs/global/global')

//Setup uuid for csrf authentication
const uuid_middleware = require('../libs/uuid_middleware')

//Login authentication middleware
const auth_login = require('../libs/auth_login')

//DB
const db = globalHandle.get('db');

//Get models
const MenuItem = globalHandle.get('menuItem')
const User = globalHandle.get('user')
const OrderItem = globalHandle.get('orderItem')
const Order = globalHandle.get('order')

//Get App
const app = globalHandle.get('app')

//Passport.js   asdasdasdasd
const passport = require('passport')

//moment
const moment = require('moment')

// Create a token generator with the default settings:
var randtoken = require('rand-token');
//nodemailer
const nodemailer = require('nodemailer');

var session = require('express-session')

//var token = '';
app.use(session({
    token : '',
    cookie: { maxAge: 600000 }
}));

app.use(passport.initialize())
app.use(passport.session())
app.use(passport.authenticate('remember-me'))

//Locals middleware
app.use((req, res, next) => {
    //Set the user to local for handlebars to access
    if(req.user != undefined)res.locals.user = req.user
    next()
})

//Nav Middleware
app.use((req, res, next) => {
    if (req.user != undefined) {
        res.locals.isCustomer = (req.user.role == 'Customer')        
    }
    next()
})

app.use((req, res, next)=>{
    //Set first login if not
    if(req.user){
        if(req.session.firstLogin == undefined)req.session.firstLogin = true
        else{
            req.session.firstLogin = false
        }
        res.locals.firstLogin = req.session.firstLogin
    }
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

const RememberMeStrategy = require('passport-remember-me').Strategy;
const rememberme_utils = require('../utils/main/rememberme')


passport.use(new RememberMeStrategy(
    function(token, done) {
        rememberme_utils.consumeToken(token, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
      })
    },
    function(user, done) {
      var token = rememberme_utils.generateToken(64);
      rememberme_utils.saveToken(token, user.id, function(err) {
        if (err) { return done(err); }
        return done(null, token);
      })
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



const profile_gen = require('../libs/profile_img_generator')
/**
 * Register GET '/register' path
 * Register page
 */
router.get('/register', uuid_middleware.generate, (req, res) => {
    res.render('register', {layout: 'blank_layout'})
})

/**
 * Register POST '/register' path
 * Params: email, password, fname, lname, dob, phone
 */


router.post('/requesttoken',(req, res) => {
    session.token = randtoken.generate(16);
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:'orderlah54@gmail.com',
            pass: 'orderlahpassword'
        }
    });

    let mailOptions = {
        from:'Orderlah Team',
        to: req.body.email,
        subject: 'testing',
        text: session.token
    };

    transporter.sendMail(mailOptions, function(err, data){
        if (err) {
            console.log('error occured: ', err)
        } else {
            console.log('email sent!!')
        }
    })
})

/*router.post('/checktoken',(req, res) => {
    if(session.token === req.body.code){
        console.log('verification success!!')
    } else {
        console.log('error occured, verification failed!')
    }    
})*/

router.post('/register', uuid_middleware.verify, (req, res) => {
    if(session.token === req.body.code){
        //Create the user account
        console.log('Verification success, account being created...')
        User.create({
            username: req.body.username,
            email: req.body.email,
            firstName: req.body.fname,
            lastName: req.body.lname,
            birthday: req.body.dob,
            phone: req.body.phone,
            password: req.body.password
        }).then(user => {
            console.log("User's auto-generated ID:", user.id)
            //Create profile pic
            profile_gen.genProfileImage(user.username.substring(0, 1)).then(img => {
                img.quality(100).write(__dirname + `/../../public/img/profiles/${user.id}.png`)
                console.log('Generated image for user:' + user.id)
            })
            res.send('Success')
        }).catch(err => {
            console.log(err)
            res.status(400)//Bad request
            res.send('Failed')
        })
    } else {
        console.log('error occured, verification failed!')
   }    
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
        failureRedirect: '/login' 
    }),
    (req, res, next) => {
        // issue a remember me cookie if the option was checked
        if (!req.body.remember_me) { return next(); }
    
        var token = rememberme_utils.generateToken(64);
        rememberme_utils.saveToken(token, req.user.id, function(err) {
          if (err) { return done(err); }
          res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
          return next();
        });
      }, (req, res) => {
        if (req.user.role === "Customer") {
            res.redirect('/')
        }
        else if (req.user.role == 'Admin') {
            res.redirect('/stallOwner/adminPanel')
        }
        else {
            res.redirect('/stallOwner/')
        }
    })

/**
 * Logout GET '/logout' path, logout from session
 */
router.get('/logout', (req, res) => {
    req.logout()
    //Destroy firstLogin
    req.session.firstLogin = undefined
    res.redirect('/login')
})



module.exports = router