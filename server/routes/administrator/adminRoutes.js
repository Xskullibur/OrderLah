//ExpressJS
const express = require('express');
const router = express.Router();

// const fs = require('fs');
// const multer = require('multer')
// const storage = require('./upload');
// const upload = multer({storage : storage })

//Login authentication middleware
const auth_login = require('../../libs/auth_login')

//MomentJS
const moment = require('moment')

//Global
//Models
const globalHandle = require('../../libs/global/global')
const Order = globalHandle.get('order');
const MenuItem = globalHandle.get('menuItem');
const Stall = globalHandle.get('stall');
const User = globalHandle.get('user')

//Get App
const app = globalHandle.get('app')

//Sequelize and DB
const Sequelize = require('sequelize')
const db = globalHandle.get('db')


router.get('/adminPanel', auth_login.authAdmin, (req, res) =>{
    User.findAll({where: {role: "Stallowner"}}).then((stallowner) =>{
        res.render('admin', {
            displayStallowner: stallowner
        })
    })
})

router.get('/showMenu', (req, res) => {
    const id = req.user.id
    User.findOne({ where: id }).then(user => {
         if(user.role === 'Admin'){
            MenuItem.findAll({where: {active: true}}).then((item) =>{
                res.render('stallowner-menu', {
                    item:item
                })
            })      
        }else{
            res.render('error')
        }      
      })
})

router.post('/submitStall',  (req, res) =>{
    const username = req.body.username
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const birthday = req.body.birthday
    const password = req.body.password
    const phone = req.body.phone
    const role = 'Stallowner'

    User.create({
        username, firstName, lastName, email, birthday, password, phone, role
    }).then(function(){
        res.send('good')
    }).catch(err => console.log(err))

})

module.exports = router;
