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

var generator = require('generate-password')

var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'acelearninghx@gmail.com',
      pass: 'feifi@85@#*#vjslrfieefe'
    }
  });

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

router.post('/submitStall', auth_login.authAdmin, (req, res) =>{
    var passGen = generator.generate({
        length: 10,
        numbers: true
    })
    const username = req.body.username
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const birthday = req.body.birthday
    const password = passGen
    const phone = req.body.phone
    const role = 'Stallowner'

    const stallName = req.body.stallName
    const description = req.body.description

    User.create({
        username, firstName, lastName, email, birthday, password, phone, role
    }).then(function(){
        const emailcheck = req.body.email
        User.findOne({ where: {email: emailcheck}}).then(user => {

            userId = user.id

            Stall.create({
                userId, stallName, description
            }).then(function(){  
                var mailOptions = {
                    from: 'Orderlah',
                    to: email,
                    subject: 'Account creation notice',
                    text: 'Hi your username is ' + email + ' and password is ' + password
                }
            
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                })   
            })

            res.render('createStallSuccess')

        }).catch(err => console.log(err))

    }).catch(err => console.log(err))


})

module.exports = router;