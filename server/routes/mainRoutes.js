const express = require('express')
//Create router
const router = express.Router()

//Global
const globalHandle = require('../libs/global/global')

//Setup uuid for csrf authentication
const uuid_middleware = require('../libs/uuid_middleware')
const uuidv4 = require('uuid/v4');

//Login authentication middleware
const auth_login = require('../libs/auth_login')

//DB
const db = globalHandle.get('db');

//Get models
const MenuItem = globalHandle.get('menuItem')
const User = globalHandle.get('user')
const OrderItem = globalHandle.get('orderItem')
const Order = globalHandle.get('order')
const ResetPass = globalHandle.get('resetpass')

//Get App
const app = globalHandle.get('app')

//Passport.js  
const passport = require('passport')

//moment
const moment = require('moment')

// Create a token generator with the default settings:
var randtoken = require('rand-token');

//nodemailer
const nodemailer = require('nodemailer');

var session = require('express-session')

//sequelize operator
const Sequelize = require('sequelize').Sequelize
const Op = Sequelize.Op

//var token = '';
app.use(session({
    token : '',
    cookie: { maxAge: 6000000 },
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

const salt_rounds = 10

const LocalStrategy = require('passport-local').Strategy;

router.post('/resetpassword/:id', (req, res) =>{
    console.log('reset post works for user: ', req.params.id)
    let password = req.body.newpassword;
    bcrypt.hash(password, salt_rounds, function(err, hash) {
        // Store hash in your password DB.
        User.update({
            password: hash
        }, {
            where: {
                id: req.params.id
            }
        }).then(() => {
            res.redirect('/login');
            console.log('reset password success! New password is: ', hash)
        }).catch((err) => console.error(err));
      });
    // User.update({
    //     password
    // }, {
    //     where: {
    //         id: req.params.id
    //     }
    // }).then(() => {
    //     res.redirect('/login');
    //     console.log('reset password success! New password is: ', password)
    // }).catch((err) => console.error(err));
})

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

var GoogleStrategy = require('passport-google-oauth20').Strategy;
const user_utils = require ('../utils/main/user')
passport.use(new GoogleStrategy({
    clientID: '284136247085-bemrg8vspbvg4ruh4k2c5bvde4dotj1m.apps.googleusercontent.com',
    clientSecret: 'ot4lMcPHgGDBdWdQgT_KVHZs',
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb){
      User.findOne({
          where:{
              email: profile.emails[0].value
          }
      }).then( user =>{
        if (!user){
            console.log('google account being created...')
            user_utils.createUserByGoogle({
                username: profile.displayName,
                firstName: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                role: "customer"
            }).then((user) => {
                cb(null, user)
            });
        }else{
            console.log('google account already created...')
            User.findOne({
                where:{
                    email: profile.emails[0].value
                }
            }).then( user =>{
             return cb(null, user)   
            })
        }
      })
  }
));

// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google', passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

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
    req.session.token = randtoken.generate(16)

    req.session.save()

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
        html: 'Your Orderlah verfication code is: ' + req.session.token
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

router.post('/register', (req, res) => {
    if(req.session.token === req.body.code){
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
    if(req.query.error){
        res.render('login', {
            layout: 'blank_layout',
            error: req.query.error
        })
    }else if(req.query.success){
        res.render('login', {
            layout: 'blank_layout',
            success: req.query.success
        })
    }else{
        res.render('login', {layout: 'blank_layout'})
    }
})

/**
 * Login POST '/login' path
 * Params: email, password
 */
router.post('/login', 
    passport.authenticate('local', { 
        failureRedirect: '/login?error=Incorrect Credientials!' 
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

router.get('/guestLogin',(req, res) =>{
    console.log('Verification success, account being created...')
    User.create({
        username: "guest"+Date.now(),
        email: "guest"+Date.now(),
        firstName: "guest"+Date.now(),
        password: ""
    }).then(user => {
        req.login(user, function(err) {
            if (err) { 
                return next(err); 
            }
            return res.redirect('/');
          });
    })
})

router.get('/forgotPassword', (req, res) =>{
    if(req.query.error){
        res.render('resetpassword1', {
            layout: 'blank_layout',
            error: req.query.error
        })
    }else if(req.query.success){
        res.render('resetpassword1', {
            layout: 'blank_layout',
            success: req.query.success
        })
    }else{
        res.render('resetpassword1', {layout: 'blank_layout'})
    }
})

const resetpassword = require ('../utils/main/reset_password')
router.post('/forgotPassword', (req, res) =>{
    User.findOne({
        where:{
            email: req.body.email
        }
    }).then( user =>{
      if (!user){
          console.log('Error! Account not found...')
          res.redirect('/forgotPassword?error=Account Not Found!')
      }else{
            resetpassword.createResetPass({
                token: uuidv4(),
                expiryTiming: new Date(Date.now()+(30*60*1000)).toISOString(), 
                userId: user.id,
            }).then(resetpassword => {
                console.log('Ok, up and runnning...')
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
                    subject: 'Reset password',
                    html: '<p>Click <a href="http://localhost:3000' + '/resetpassword/' + resetpassword.userId + '/' + resetpassword.token +'">here</a> to reset your password</p>'
                };
            
                transporter.sendMail(mailOptions, function(err, data){
                    if (err) {
                        console.log('error occured: ', err)
                        res.redirect('/forgotPassword?error=' + err)
                    } else {
                        console.log('reset password email sent to user id:', resetpassword.userId, 'token:', resetpassword.token)
                        res.redirect('/forgotPassword?success=Email sent!')
                    }
                })
            })
            .catch(err => console.log(err))
            
            
        }
    })
})

/*DEBUG route for getting token */
if(process.env.NODE_ENV === 'dev'){
    router.get('/debug/token/:userId', (req, res) => {
        const userId = req.params.userId
        //Get the token for user id 
        ResetPass.findOne({
            where: {
                userId,
                expiryTiming:{
                    [Op.gt]: new Date()
                },
                active: true
            }
        }).then(resetpassword => {
            if(!resetpassword){
                res.send('No valid token')
            }else{
                res.type('json')
                res.send(JSON.stringify(resetpassword))
            }
        }).catch(err => {
            console.log(err)
            res.send('No valid token')
        })
    })
}

router.get('/resetpassword/:id/:token', (req, res) =>{
    User.findOne({
        where:{
            id: req.params.id
        }
    }).then( user =>{
        if(!user){
            console.log('Error! Account not found...')
        }
        else{
            ResetPass.findOne({
                where: {
                    userId: req.params.id,
                    expiryTiming:{
                        [Op.gt]: new Date()
                    },
                    token: req.params.token,
                    active: true
                }
            }).then(resetpassword => {
                if(!resetpassword){
                    console.log('Error! Resetaccount issue...')
                }
                else{
                    res.render('resetpassword2', {
                        user,
                        layout: 'blank_layout'
                    })
                    ResetPass.update({
                        active: false
                    }, {
                        where: {
                            userId: req.params.id,
                            token: req.params.token
                        }
                    })
                }
            })
        }
    })
})

module.exports = router