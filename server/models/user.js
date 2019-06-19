/**
 * This class define the 'user' model for the database definition
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
            
            const User = db.define('user', {
                username: {type: Sequelize.STRING, allowNull: false, unique: true},
                firstName: {type: Sequelize.STRING, allowNull: false},
                lastName: {type: Sequelize.STRING, allowNull: true},
                email:  {type: Sequelize.STRING, allowNull: false, unique: true},
                birthday:  {type: Sequelize.DATE, allowNull: false},
                password:  {type: Sequelize.STRING, allowNull: false},
                phone:  {type: Sequelize.STRING(10), allowNull: false},
                role: {type: Sequelize.ENUM('Customer', 'Admin', 'Stallowner', 'Inactive'), allowNull: false, defaultValue:'Customer'},
            })
    
            //Hash the password using bcrypt
            User.beforeCreate((user, options) => {
                //Generate salt and store hashed password
                return bcrypt.hash(user.password, salt_rounds).then(hash => {
                        user.password = hash
                    })
    
            })

            //Verify password
            User.prototype.verifyPassword = function(password) {
                return bcrypt.compareSync(password, this.password)
            }
    
            //Return user model object IMPORTANT
            return User
    
    
        }
    })()
}