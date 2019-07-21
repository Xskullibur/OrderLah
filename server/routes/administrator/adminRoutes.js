//ExpressJS
const express = require('express');
const router = express.Router();

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

const bcrypt = require('bcrypt')

const saltRounds = 10

var displayAlert = []

const op = Sequelize.Op

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'acelearninghx@gmail.com',
      pass: 'feifi@85@#*#vjslrfieefe'
    }
  });

function toCap(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' ')
}

function checkUnique(theName){
    return MenuItem.count({where: {itemName: theName}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}


router.get('/adminPanel', auth_login.authAdmin, (req, res) =>{
    User.findAll({where: {role: "Stallowner"}}).then((stallowner) =>{
        res.render('admin', {
            displayStallowner: stallowner,
            displayAlert: displayAlert
        })
        displayAlert = []
    })
})

router.post('/submitStall', auth_login.authAdmin, (req, res) =>{
    var passGen = generator.generate({
        length: 15,
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

            //res.render('./successErrorPages/createStallSuccess')
            displayAlert.push("successfully added stall!")
            res.redirect('/admin/adminPanel')
        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
})

router.post('/lockAccount', auth_login.authAdmin, (req, res) =>{
    const userID = req.body.userID
    const role = 'Inactive'
    const active = false
    User.findOne({where: {id: userID}}).then((stallowner) =>{
        User.update({role}, {where: {id:req.body.userID}}).then(function(){
            Stall.findOne({where: {userId: userID}}).then(theStall =>{
                MenuItem.update({active}, {where:{stallId: theStall.id}}).then(function(){
                    var mailOptions = {
                        from: 'Orderlah',
                        to: stallowner.email,
                        subject: 'Account lockdown notice',
                        text: 'Hi your stall account have been locked'
                    }
                
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })   
                    displayAlert.push("successully locked account!")
                    res.redirect('/admin/adminPanel')
                })
            })            
        })
    })
    
})

router.post('/resetPassword', auth_login.authAdmin, (req,res) =>{
    var passGen = generator.generate({
        length: 15,
        numbers: true
    })
    const userID = req.body.userID
    
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(passGen, salt).then(hash =>{
            User.findOne({where: {id: userID}}).then((stallowner) =>{
                User.update({password: hash}, {where:{id: userID}}).then(function(){
                    const email = stallowner.email
                    var mailOptions = {
                        from: 'Orderlah',
                        to: email,
                        subject: 'Account password reset',
                        text: 'Hi your account password have been reset new password is ' + passGen
                    }
                
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })   
                })
                displayAlert.push("account password reset!")
                res.redirect('/admin/adminPanel')              
            })          
        })
    })   
})

router.post('/filterItem', auth_login.authAdmin, (req, res) =>{
    var filterName = '%' + toCap(req.body.filterName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n")) + '%'
    User.findAll({where: {role: "Stallowner", username:{[op.like]: filterName}}}).then((stallowner) =>{
        res.render('admin', {
            displayStallowner: stallowner,
        })
    })  
})

module.exports = router;
