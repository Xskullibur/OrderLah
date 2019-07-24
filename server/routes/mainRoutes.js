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

//Passport.js
const passport = require('passport')

//moment
const moment = require('moment')

const fs = require('fs');
const multer = require('multer')
const storage = require('./uploadProfile')
const upload = multer({storage : storage })

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
        res.locals.isAdmin = (req.user.role == 'Admin')        
    }
    next()
})

//Handlebars locals
app.use((req, res, next)=>{

    res.locals.isDev = process.env.NODE_ENV === 'dev'

    res.locals.autoLogin = process.env.AUTO_LOGIN  === 'YES'
    res.locals.autoLoginAs = process.env.LOGIN_AS

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
    registerFail = []
})

/**
 * Register POST '/register' path
 * Params: email, password, fname, lname, dob, phone
 */
router.post('/register', uuid_middleware.verify, async (req, res) => {
    var username = req.body.username
    var email = req.body.email
    var phone = req.body.phone

    await checkUniqueUsername(username).then(isUnique => {
        if(!isUnique){
            registerFail.push(' username: ' + username + ' ')
        }
    })

    await checkUniqueEmail(email).then(isUnique =>{
        if(!isUnique){
            registerFail.push(' Email: ' + email + ' ')
        }
    })

    await checkUniquePhone(phone).then(isUnique => {
        if(!isUnique){
            registerFail.push(' Phone: ' + phone + ' ')
        }
    })

    if(registerFail.length > 0){
        //res.redirect('/login')
    }else{
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
    } 
})

/**
 * Login GET '/login' path
 */
router.get('/login', (req, res) => {
    res.render('login', {layout: 'blank_layout', displayAlert:failAlert})
    failAlert = []
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
            res.redirect('/admin/adminPanel')
        }
        else if (req.user.role == 'Inactive') {
            failAlert.push("Your account has been locked please contact admin for more details")
            res.redirect('/login')
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



/* HsienXiang route */

/**
 * GET '/profile' path
 * Get Profile page
 */

function checkUniqueEmail(theEmail){
    return User.count({where: {email: theEmail}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

function checkUniqueUsername(theName){
    return User.count({where: {username: theName}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

function checkUniquePhone(theNumber){
    return User.count({where: {phone: theNumber}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

var displayAlert = []
var failAlert = []
var registerFail = []

router.get('/profile', auth_login.auth, (req, res) => {
    const UserID = req.user.id
    res.render('profile', {birthday: req.user != undefined ? moment(req.user.birthday).format('YYYY-MM-DD') : '', displayAlert:displayAlert, failAlert:failAlert, UserID:UserID})
    displayAlert = []
    failAlert = []
})

router.post('/changePass', (req, res) =>{  
    if(req.body.password != req.body.password2){
        failAlert.push(' password does not match' )
        res.redirect('/profile')
    }else{
        displayAlert.push('password successfully changed')
        bcrypt.hash(req.body.password, 10).then(hash =>{
            User.update({password: hash}, {where:{id: req.user.id}}).then(function(){
                res.redirect('/profile')
            })
        })
    }   
})

function checkUniquePhone(theNumber){
    return User.count({where: {phone: theNumber}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

function checkUniqueEmail(theEmail){
    return User.count({where: {email: theEmail}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

router.post('/updateProfile', upload.single('profileImage'), async (req, res) =>{
    var email = req.body.email.replace(/\s/g, "")
    var phone = req.body.phone.replace(/\s/g, "")
    var birthday = req.body.birthday
    const checkEmail = req.body.checkEmail.replace(/\s/g, "")
    const checkPhone = req.body.checkPhone.replace(/\s/g, "")
    console.log(checkEmail)
    console.log(email)
    console.log(checkPhone)
    console.log(phone)


    await checkUniqueEmail(email).then(isUnique =>{
        if(email === checkEmail){

        }else if(!isUnique){
            failAlert.push(' Email: ' + email + ' ')
        }
    })

    await checkUniquePhone(phone).then(isUnique => {
        if(phone === checkPhone){

        }else if(!isUnique){
            failAlert.push(' Phone: ' + phone + ' ')
        }
    })

    if(failAlert.length > 0){
        res.redirect('/profile')
    }else{
        User.update({email, phone, birthday}, {where: {id: req.user.id}}).then(function(){
            displayAlert.push('profile successfully updated')
            res.redirect('/profile')
        })
    }
})

module.exports = router