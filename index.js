
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
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }//Set this to true for https website
}))

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

//Put User model inside global
globalHandle.put('user', User)
globalHandle.put('stall', Stall)
globalHandle.put('order', Order)
globalHandle.put('orderItem', OrderItem)
globalHandle.put('menuItem', MenuItem)
globalHandle.put('cusine', Cusine)
globalHandle.put('db', sequelize_db)

//connect to db
const dummy = require('./dummy')
db.connect(true, dummy)

//Serve static files for css, js, etc.
app.use(express.static('public'))

//Setup path
const mainRoutes = require('./server/routes/mainRoutes')
const customerRoutes = require('./server/routes/customer/customerRoutes')
const stallOwnerRoutes = require('./server/routes/stallowner/stallOwnerRoutes');
const stallOwnerandAdminRoute = require('./server/routes/stallowner/stallownerRoute')
app.use(mainRoutes)
app.use(customerRoutes)
app.use('/stallOwner', stallOwnerRoutes)
// app.use('/stallOwner', stallOwnerandAdminRoute)



app.listen(port, () => {
    console.log(`Server is listening ${port}`);
})
///