
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
app.use('/', mainRoutes)


app.listen(port, () => {
    console.log(`Server is listening ${port}`);
})