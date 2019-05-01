
//Hyper parameters

//Server will be listening on port 3000
const port = 3000

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const exphbs = require('express-handlebars')

//Setup express
const app = express()

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

//Serve static files for css, js, etc.
app.use(express.static('public'))

//Setup path
const mainRoutes = require('./server/routes/mainRoutes')
app.use(mainRoutes)

//Database
const db = require('./server/models/db_init')
const User = db.User

User.create({
    username: 'John',
    email: 'Hancock',
    birthday: '11/2/2018',
    password: 'test',
    phone: '1231231'
}).then(john => {
    console.log("Jane's auto-generated ID:", john.id);
  }).catch(err => console.log(err))

//connect to db
db.connect()

app.listen(port, () => {
    console.log(`Server is listening ${port}`);
})