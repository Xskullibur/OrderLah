const express = require('express')
//Create router
const router = express.Router()

//Global
const globalHandle = require('../../libs/global/global')

//Setup uuid for csrf authentication
const uuid_middleware = require('../../libs/uuid_middleware')

//Login authentication middleware
const auth_login = require('../../libs/auth_login')

//Get User model
const User = globalHandle.get('user')

//Get App
const app = globalHandle.get('app')



//Define main 'customer' path

router.get('/review', (req, res) => {
    res.render('customer/review',{})
});

router.get('/pastorders', (req, res) => {
    res.render('customer/pastorders',{})
});


module.exports = router