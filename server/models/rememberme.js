/**
 * This class define the 'rememberme' model for the database definition
 * Definition:
 *  username: varchar(255) NN U
 *  firstName: varchar(255) NN
 *  lastName: varchar(255) NN
 *  email: varchar(255) NN U
 *  birthday: DATE NN
 *  password: varchar(255) NN
 *  birthday: varchar(10) NN
 * Hooks:
 *  beforeCreate: password will be hashed before storing to database
 *  
 */
const bcrypt = require('bcrypt')

const salt_rounds = 10


module.exports = {
    model: (function(){
        return function (Sequelize, db){
            
            const RememberMe = db.define('rememberme', {
                token: {type: Sequelize.STRING, allowNull: false, unique: true},
                expired: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
            })

            //Return RememberMe model object IMPORTANT
            return RememberMe
    
    
        }
    })()
}