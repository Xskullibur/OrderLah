
//Hyper parameters

//Server will be listening on port 3000
const port = 3000

//Global
const globalHandle = require('./server/libs/global/global')

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const exphbs = require('express-handlebars')

const helpers = require('./server/helpers/helpers')

//Redis
const redis = require('redis')
var client = redis.createClient();

redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
})

//RedisStore
var RedisStore = require('connect-redis')(session)
let redisStore = new RedisStore({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    client: client,
})

//Setup express
const app = express()
//Put app inside global
globalHandle.put('app', app)

//Setup handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main_layout', helpers}))
app.set('view engine', 'handlebars')

//Parsers
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())
app.use(cookieParser())


//Session
app.use(session({
    secret: ']x?f4c?3STdk3<6q_h>4jL%{Hi}_',
    store: redisStore,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false }//Set this to true for https website
}))

app.use((req, res, next) => {
    if (!req.session) {
        return next(new Error('Lost Connestion to Redis'))
    }
    next()
})

//Setup debug if needed
const debug = require('./server/debug')
debug.debugSetup(app)


//Database
const db = require('./server/models/db_init')
const User = db.User
const Stall = db.Stall
const Order = db.Order
const OrderItem = db.OrderItem
const MenuItem = db.MenuItem
const Cusine = db.Cusine
const sequelize_db = db.db

const RememberMe = db.RememberMe

//Redis inside global
globalHandle.put('redis', redisStore)

//Put User model inside global
globalHandle.put('user', User)
globalHandle.put('stall', Stall)
globalHandle.put('order', Order)
globalHandle.put('orderItem', OrderItem)
globalHandle.put('menuItem', MenuItem)
globalHandle.put('cusine', Cusine)
globalHandle.put('db', sequelize_db)

globalHandle.put('rememberme', RememberMe)

//connect to db
const dummy = require('./dummy')
db.connect(true, dummy)

//Serve static files for css, js, etc.
app.use(express.static('public'))

//Setup path
const mainRoutes = require('./server/routes/mainRoutes')
const customerRoutes = require('./server/routes/customer/customerRoutes')
const stallOwnerRoutes = require('./server/routes/stallowner/stallOwnerRoutes');
app.use(mainRoutes)
app.use(customerRoutes)
app.use('/stallOwner', stallOwnerRoutes)

//Websocket setup
require('./server/libs/orderlah_websocket/orderlah_websocket')



app.listen(port, () => {
    console.log(`Server is listening ${port}`);
})
///