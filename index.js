
//Hyper parameters

//Server will be listening on port 3000
const port = process.env.PORT || 3000

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
var client = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    no_ready_check: true,
    auth_pass: process.env.REDIS_PASSWORD || undefined
})

client.on('connect', () => {
    console.log("Redis is connected");
    
})

client.on('error', (err) => {
    console.log(err);
    
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

//Import self signed cert (for dev only)
const fs = require('fs')
const crypto = require('crypto')

const signedCert = './.cert/dev-server.cert'
const signedKey = './.cert/dev-server.key'

let server = null

if(process.env.HTTPS == 'YES' && fs.existsSync(signedCert) && fs.existsSync(signedKey)){
    console.log('Using HTTPS connections')
    //Self-signed cert exists
    server = require('https').createServer({
        key: fs.readFileSync(signedKey).toString(),
        cert: fs.readFileSync(signedCert).toString()
    }, app)
}else{
    server = require('http').createServer(app)
}


globalHandle.put('server', server)


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
const Payments = db.Payments

const RememberMe = db.RememberMe

//Redis inside global
globalHandle.put('redis-store', redisStore)
globalHandle.put('redis-client', client)

//Put User model inside global
globalHandle.put('user', User)
globalHandle.put('stall', Stall)
globalHandle.put('order', Order)
globalHandle.put('orderItem', OrderItem)
globalHandle.put('menuItem', MenuItem)
globalHandle.put('cusine', Cusine)
globalHandle.put('db', sequelize_db)

globalHandle.put('rememberme', RememberMe)
globalHandle.put('payments', Payments)

//connect to db
const dummy = require('./dummy')
db.connect(true, dummy)

//Serve static files for css, js, etc.
app.use(express.static('public'))
//Serve service worker js files for push notications
app.use(express.static('push', {
    setHeaders: function(res, path, stat) {
        res.set('Service-Worker-Allowed', '/')
    }
}))

//Push notificaions setup
require('./server/libs/orderlah_push_notifications/push_notifications')(app)
//Websocket setup
const {sendOrderToStallOwner} = require('./server/libs/orderlah_websocket/orderlah_websocket')
globalHandle.put('websocket:sendOrderToStallOwner', sendOrderToStallOwner)

//Setup path
const mainRoutes = require('./server/routes/mainRoutes')
const customerRoutes = require('./server/routes/customer/customerRoutes')
const stallOwnerRoutes = require('./server/routes/stallowner/stallOwnerRoutes');
const adminRoutes = require('./server/routes/administrator/adminRoutes');
app.use(mainRoutes)
app.use(customerRoutes)
app.use('/stallOwner', stallOwnerRoutes)
app.use('/admin', adminRoutes)


// process.on('SIGTERM', () => {
//     close()
// });

// process.on('SIGINT', () => {
//     close()
// });

// process.on('exit', () => {
//     close()
// });

// function close(){
//     console.log('Closing http server.');
//     server.close(() => {
//         console.log('Http server closed.');
//     });
// }

app.set('port', port);
server.listen(port, () => {
    console.log(`Server is listening ${port}`);
})