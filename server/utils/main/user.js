//Global
const globalHandle = require('../../libs/global/global')
//models
const User = globalHandle.get('user')
/**
 * User with LastName
 * @typedef {Object} UserLastName
 * @property {string} username
 * @property {string} firstName 
 * @property {string} lastName 
 * @property {string} email 
 * @property {Date} birthday 
 * @property {string} password 
 * @property {string} phone 
 * @property {string=} role - 'Customer', 'Admin', 'Stallowner' (default Customer)
 */
/**
 * User
 * @typedef {Object} User
 * @property {string} username
 * @property {string} firstName 
 * @property {string} email 
 * @property {Date} birthday 
 * @property {string} password 
 * @property {string} phone 
 * @property {string=} role - 'Customer', 'Admin', 'Stallowner' (default Customer)
 */
module.exports = {

    /**
     * Create a new user for OrderLah inside database
     * @param {UserLastName} user - to be created inside database
     */
    createUserWithLastName: function({username, firstName, lastName, email, birthday, password, phone, role = 'Customer'}){
        return User.create({
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            birthday: birthday,
            password: password,
            phone: phone,
            role: role,
        })
    },

    /**
     * Create a new user for OrderLah inside database
     * @param {User} user - to be created inside database
     */
    createUser: function({username, firstName, email, birthday, password, phone, role = 'Customer'}){
        return User.create({
            username: username,
            firstName: firstName,
            email: email,
            birthday: birthday,
            password: password,
            phone: phone,
            role: role,
        })
    },
    createUserByGoogle: function({username, firstName, email, googleid, role = 'Customer'}){
        return User.create({
            username: username,
            firstName: firstName,
            email: email,
            password: "",
            googleId: googleid,
            role: role,
        })
    },
    getUserByID(userId){
        return User.findByPk(userId)
    }
}