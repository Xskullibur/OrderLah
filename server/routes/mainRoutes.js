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

app.use(passport.initialize())
app.use(passport.session())


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

passport.serializeUser(function(user, done) {   
    done(null, user.id)
})
  
passport.deserializeUser(function(id, done) {
    User.findByPk(id)
    .then(user => done(null, user))
    .catch(done => console.log(done))
})

//Define main 'route' path

const cusine_util = require('../utils/stallowner/cusine')
const menu_item_util = require('../utils/main/menu_item')

/**
 * Default GET '/' path
 */
router.get('/', auth_login.auth, (req, res) => {
    cusine_util.getAllCusine().then(cusines => {
        res.render('index', {cusines: cusines})
    })
})

/**
 * GET '/profile' path
 * Get Profile page
 */
router.get('/profile', auth_login.auth, (req, res) => {
    res.render('profile', {birthday: req.user != undefined ? moment(req.user.birthday).format('YYYY-MM-DD') : ''})
})
/**
 * Get '/menuItem' all menu items inside the database as JSON
 */
router.get('/menuItems/', auth_login.auth, (req, res) => {
    res.type('json')
    menu_item_util.getAllMenuItem().then( menuItems => {
        res.type('json')
        res.send(JSON.stringify(menuItems))
    })

})
/**
 * Get '/menuItem/:cusine' all menu items where cusine is {Asian, Japanese, Western} inside the database as JSON
 */
router.get('/menuItems/:cusine', auth_login.auth, async (req, res) => {
    let cusine = req.params.cusine
    cusine = await cusine_util.getCusineByCusineType(cusine)
    res.type('json')
    menu_item_util.getMenuItemByCusine(cusine.id).then( menuItems => {
            res.send(JSON.stringify(menuItems))
    })

})

const getRatingMatrix = require('../ratings/ratings')
const SVD_Optimizer = require('../libs/ml/svd_sgd')

let optimizer;


/**
 * GET '/recommendedMenuItems'
 * Return user perferences menu items
 */
router.get('/recommendedMenuItems', auth_login.auth, (req, res) => {
    //let userId = req.user.id

    trainIfNotTrained(() => {
        let menuItemsIds = optimizer.getRatingMatrix()[1]
        menuItemsIds = argsort(menuItemsIds).slice(0, 5)
    
        menuItemsIds = menuItemsIds.map(v => menu_item_util.getMenuItemByID(v))
    
        Promise.all(menuItemsIds).then(menuItems => {
            menuItems = menuItems.filter((e) => e != null)
            res.type('json')
            res.send(JSON.stringify(menuItems))
        })
    })



    
})

function trainIfNotTrained(cb){
    if(optimizer == undefined || optimizer == null){
        getRatingMatrix(db, MenuItem, User).then((ratings) => {
            optimizer = new SVD_Optimizer(ratings, 20, 0.001, 1000)
            optimizer.reset()
            optimizer.train()
            cb()
        })
    }else{
        getRatingMatrix(db, MenuItem, User).then((ratings) => {
            //Retrain
            optimizer.updateRatingsMatrix(ratings)
            optimizer.iterations = 100
            optimizer.train()
            cb()
        })
        
    }
}


function argsort(arr){
    return arr.map((item, index) => [item, index])
    .sort((a,b) => b[0] - a[0])
    .map(v => v[1])
}

router.get('/getRatingData', async (req, res) =>{

    
    let optimizer = new SVD_Optimizer()
    
    let pMatrix = optimizer.getRatingMatrix()
    console.log(ratings);
    res.send(pMatrix)
})

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
    }), (req, res) => {
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