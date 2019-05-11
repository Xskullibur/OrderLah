/**
 * import this module to initialize all database models
 * 
 * Steps:
 * const db = require('./db_init')
 * const User = db.User
 * 
 * TO CONNECT
 * db.connect()
 * 
 * 
 */

const process = require('process')

const connection_details = {
    host: process.env.DB_HOST,
    database: "orderlah_db",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
}

const Sequelize = require('sequelize')
const db = new Sequelize(connection_details.database, connection_details.username, connection_details.password, {
    host: connection_details.host,
    dialect: 'mysql',

    define: {
        timestamps: false
    },

    pool:{
        max: 15, // MAX of 15 concurrent connections
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const User = require('./user').model(Sequelize, db)
const Stall = require('./stall').model(Sequelize, db)

module.exports = {
    //Models
    User, Stall,

    connect: function (drop = false, done) {
        //Init database connections
        db.authenticate().then(() => {
            console.log("Successfully connected to database");
            
            User.hasOne(Stall);

            //Create tables
            db.sync({ // Creates table if none exists
                force: drop
            }).then(() =>{
                console.log('Created tables') 
                done()
            }).catch(err=>console.log(err))
        }).catch((err) => {
            console.log("Oops, an error occur when connecting to database. Check if your database is running and the database account credentials are all correct!")
            console.log(`Details: \n\r${err}`)
        })
    }

}

