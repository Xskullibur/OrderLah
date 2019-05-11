
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

//Setup express
const app = express()
//Put app inside global
globalHandle.put('app', app)

//Setup handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main_layout'}))
app.set('view engine', 'handlebars')

//Parsers
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(cookieParser())

//Session
app.use(session({
    secret: ']x?f4c?3STdk3<6q_h>4jL%{Hi}_',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }//Set this to true for https website
}))

//Database
const db = require('./server/models/db_init')
const User = db.User
const Stall = db.Stall
const Order = db.Order
const OrderItem = db.OrderItem
const MenuItem = db.MenuItem

//Put User model inside global
globalHandle.put('user', User)

//connect to db
db.connect(true, () => {

    //Create test user
    User.create({
        username: 'John',
        firstName: 'john',
        email: 'Hancock@test',
        birthday: new Date('11/2/2018'),
        password: 'test',
        phone: '1231231',
        role: 'Customer',
    }).then(john => {
        console.log("John's auto-generated ID:", john.id);
    }).catch(err => console.error(err))

    //Create Stall and Owner
    User.create({
        username: 'Nosla',
        firstName: 'nosla',
        email: 'nosla@chickenrice',
        birthday: new Date('2000/09/16'),
        password: 'tuturu~',
        phone: '91234567',
        role: 'Admin',

    }).then(stallOwner => {

        console.info('\nNosla (Stall Owner):', stallOwner.dataValues);

        Stall.create({
            stallName: 'Nosla\'s Chicken Rice',
            cusine: 'Asian',
            description: 'Enjoy the best Chicken Rice here at Nosla\'s Chicken Rice Stall Today!',
            userId: stallOwner.id,
        }).then(stall => {
            console.info('\nNosla\'s Chicken Rice Stall:', stall.dataValues);
        }).catch(err => console.error(err))

    }).catch(err => console.error(err))

})

//Serve static files for css, js, etc.
app.use(express.static('public'))

//Setup path
const mainRoutes = require('./server/routes/mainRoutes')
app.use(mainRoutes)

app.listen(port, () => {
    console.log(`Server is listening ${port}`);
})