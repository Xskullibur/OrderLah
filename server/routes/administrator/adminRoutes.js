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

const uuid_middleware = require('../../libs/uuid_middleware')

//Get App
const app = globalHandle.get('app')

//Sequelize and DB
const Sequelize = require('sequelize')
const db = globalHandle.get('db')

var generator = require('generate-password')

var nodemailer = require('nodemailer')

const bcrypt = require('bcrypt')

const saltRounds = 10

const op = Sequelize.Op

var validator = require('validator')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'orderlah54@gmail.com',
      pass: 'orderlahpassword'
    }
  });

function toCap(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' ')
}

function checkUniqueStall(theName){
    return Stall.count({where: {stallName: theName}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

function checkUniqueEmail(theEmail){
    return User.count({where: {email: theEmail}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

function checkUniqueUsername(theName){
    return User.count({where: {username: theName}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

function checkUniquePhone(theNumber){
    return User.count({where: {phone: theNumber}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

router.get('/adminPanel', auth_login.authAdmin, (req, res) =>{
    User.findAll({where: {role: "Stallowner"}}).then((stallowner) =>{
        User.findAll({where: {role: "Inactive"}}).then((inactive) =>{
            res.render('admin/admin', {
                displayStallowner: stallowner,
                displayLocked: inactive,      
            })
        })        
    })
})

router.post('/submitStall', auth_login.authAdmin, uuid_middleware.verify, async (req, res) =>{
    var passGen = generator.generate({
        length: 15,
        numbers: true
    })

    const username = toCap(req.body.username.replace(/\s/g, ""))
    const firstName = toCap(req.body.firstName.replace(/\s/g, ""))
    const lastName = toCap(req.body.lastName.replace(/\s/g, ""))
    const email = req.body.email.replace(/\s/g, "")
    const birthday = req.body.birthday
    const password = passGen
    const phone = req.body.phone.replace(/\s/g, "")
    const role = 'Stallowner'

    var allUnique = true    
    var userUnique = true
    var emailUnique = true
    var phoneUnique = true
    var stallUnique = true

    const stallName = toCap(req.body.stallName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n"))
    const description = req.body.description.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n")

    if(!validator.isEmpty(username) && !validator.isEmpty(firstName) && !validator.isEmpty(lastName) && !validator.isEmpty(email) && !validator.isEmpty(birthday) && !validator.isEmpty(phone) && !validator.isEmpty(stallName) && !validator.isEmpty(description)
    && validator.isAlphanumeric(username.replace(/\s/g,'')) && validator.isAlpha(firstName.replace(/\s/g,'')) && validator.isAlpha(lastName.replace(/\s/g,'')) && validator.isNumeric(phone) && validator.isAlpha(stallName.replace(/\s/g,''))
    && validator.isEmail(email) && validator.isBefore(birthday, new Date().toString()) && validator.isLength(username, {min:0, max:50}) && validator.isLength(firstName, {min:0, max:50}) && validator.isLength(lastName, {min:0, max:50}) 
    && validator.isLength(stallName, {min:0, max:50}) && validator.isLength(description, {min:0, max:255})){
        console.log('pass validation')
        await checkUniqueUsername(username).then(isUnique => {
            if(!isUnique){            
                userUnique = false
                allUnique = false
            }
        })
    
        await checkUniqueEmail(email).then(isUnique =>{
            if(!isUnique){               
                emailUnique = false
                allUnique = false
            }
        })
    
        await checkUniquePhone(phone).then(isUnique => {
            if(!isUnique){               
                phoneUnique = false
                allUnique = false
            }
        })
    
        await checkUniqueStall(stallName).then(isUnique => {
            if(!isUnique){               
                stallUnique = false
                allUnique = false
            }
        })
    
        if(allUnique){               
            User.create({username, firstName, lastName, email, birthday, password, phone, role }).then(function(){
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
                            html: `
                            <div style="border: 1px solid rgba(200,200,200,1.00);">
                                <div style="background-color: darkorange; padding: 1px 20px;">
                                    <h3>Account creation notice</h3>
                                </div>
                                <div style="padding: 20px 20px 0;">
                                    <p>Hi your username is ${email} and password is ${password}</p>
                                    <hr/>
                                    <div>
                                        <p style="text-align: right;">
                                            <img src="tuturu" width="10%" height="auto"/>
                                        </p>
                                    </div>
                                </div>
                            </div>`,
                            attachments: [{
                                filename: 'logo.png',
                                path: process.cwd()+ '/public/img/logo.png',
                                cid: 'tuturu' //same cid value as in the html img src
                            }]
                        }
                    
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        })   
                    })  
                    req.session.alerts = [{
                        message: 'Stallowner successfully added'
                    }]
                    res.send('success')
                    console.log('all unique')          
                }).catch(err => console.log(err))
        
            }).catch(err => console.log(err))
        }else{
            uuid_middleware.registerToken(req, req.body.csrf)
            res.status(400)
            if(!userUnique){
                res.send('The username ' + username + ' is already taken')
            }
            if(!emailUnique){
                res.send('The email ' + email + ' is already taken')
            }
            if(!phoneUnique){
                res.send('The Phone Number ' + phone + ' is already taken')
            }
            if(!stallUnique){
                res.send('The stall name ' + stallName + ' is already taken')
            }
        }
    }else{
        console.log('validation fail')
        uuid_middleware.registerToken(req, req.body.csrf)
        res.status(400)           
    }  
})

router.post('/lockAccount', auth_login.authAdmin, uuid_middleware.verify, (req, res) =>{
    const userID = req.body.userID
    const role = 'Inactive'
    const active = false
    User.findOne({where: {id: userID}}).then((stallowner) =>{
        if(stallowner.role === 'Stallowner'){
            User.update({role}, {where: {id:req.body.userID}}).then(function(){
                Stall.findOne({where: {userId: userID}}).then(theStall =>{
                    MenuItem.update({active}, {where:{stallId: theStall.id}}).then(function(){
                        let mailOptions = {
                            from:'Orderlah Team',
                            to: stallowner.email,
                            subject: 'Account lockdown notice',
                            html: `
                            <div style="border: 1px solid rgba(200,200,200,1.00);">
                                <div style="background-color: darkorange; padding: 1px 20px;">
                                    <h3>Account lockdown notice</h3>
                                </div>
                                <div style="padding: 20px 20px 0;">
                                    <p>Hi your account has been locked, contact admin54@gamil.com for more detail</p>
                                    <hr/>
                                    <div>
                                        <p style="text-align: right;">
                                            <img src="tuturu" width="10%" height="auto"/>
                                        </p>
                                    </div>
                                </div>
                            </div>`,
                            attachments: [{
                                filename: 'logo.png',
                                path: process.cwd()+ '/public/img/logo.png',
                                cid: 'tuturu' //same cid value as in the html img src
                            }]
                        }                   
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        })
                        req.session.alerts = [{
                            message: 'successfuly locked account'                            
                        }]   
                        res.redirect('/admin/adminPanel')
                    })
                })            
            })
        }else{
            req.session.alerts = [{
                message: 'selected account is not stallowner',
                type: 'alert-danger'
            }]   
            res.redirect('/admin/adminPanel')
        }       
    })   
})

router.post('/unlockAccount', auth_login.authAdmin, uuid_middleware.verify, (req, res) =>{
    const userID = req.body.userID
    const role = 'Stallowner'
    const active = true
    User.findOne({where: {id: userID}}).then((stallowner) =>{
        User.update({role}, {where: {id:req.body.userID}}).then(function(){
            Stall.findOne({where: {userId: userID}}).then(theStall =>{
                MenuItem.update({active}, {where:{stallId: theStall.id}}).then(function(){
                    var mailOptions = {
                        from: 'Orderlah',
                        to: stallowner.email,
                        subject: 'Account unlock notice',
                        html: `
                        <div style="border: 1px solid rgba(200,200,200,1.00);">
                            <div style="background-color: darkorange; padding: 1px 20px;">
                                <h3>Account unlock notice</h3>
                            </div>
                            <div style="padding: 20px 20px 0;">
                                <p>Hi your account has been unlocked</p>
                                <hr/>
                                <div>
                                    <p style="text-align: right;">
                                        <img src="tuturu" width="10%" height="auto"/>
                                    </p>
                                </div>
                            </div>
                        </div>`,
                        attachments: [{
                            filename: 'logo.png',
                            path: process.cwd()+ '/public/img/logo.png',
                            cid: 'tuturu' //same cid value as in the html img src
                        }]
                    }               
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })   
                    req.session.alerts = [{
                        message: 'successfuly unlocked account'
                    }]   
                    res.redirect('/admin/adminPanel')
                })
            })            
        })
    })   
})

router.post('/resetPassword', auth_login.authAdmin, uuid_middleware.verify, (req,res) =>{
    var passGen = generator.generate({
        length: 15,
        numbers: true
    })
    const userID = req.body.userID
    User.findOne({where: {id: userID}}).then((stallowner) =>{
        if(stallowner.role === 'Stallowner'){
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(passGen, salt).then(hash =>{
                    User.findOne({where: {id: userID}}).then((stallowner) =>{
                        User.update({password: hash}, {where:{id: userID}}).then(function(){
                            const email = stallowner.email
                            var mailOptions = {
                                from: 'Orderlah',
                                to: email,
                                subject: 'Account password reset',
                                html: `
                                <div style="border: 1px solid rgba(200,200,200,1.00);">
                                    <div style="background-color: darkorange; padding: 1px 20px;">
                                        <h3>Account password reset</h3>
                                    </div>
                                    <div style="padding: 20px 20px 0;">
                                        <p>Hi your account password have been reset new password is ${passGen}</p>
                                        <hr/>
                                        <div>
                                            <p style="text-align: right;">
                                                <img src="tuturu" width="10%" height="auto"/>
                                            </p>
                                        </div>
                                    </div>
                                </div>`,
                                attachments: [{
                                    filename: 'logo.png',
                                    path: process.cwd()+ '/public/img/logo.png',
                                    cid: 'tuturu' //same cid value as in the html img src
                                }]
                            }
                        
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            })   
                        })
                        req.session.alerts = [{
                            message: 'successfuly reset account'
                        }]   
                        res.redirect('/admin/adminPanel')             
                    })          
                })
            })
        }else{
            req.session.alerts = [{
                message: 'selected account is not stallowner',
                type: 'alert-danger'
            }]   
            res.redirect('/admin/adminPanel')
        }
    })   
})

router.post('/filterItem', auth_login.authAdmin, (req, res) =>{
    var filterName = '%' + toCap(req.body.filterName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n")) + '%'
    User.findAll({where: {role: "Stallowner", username:{[op.like]: filterName}}}).then((stallowner) =>{
        res.render('admin/admin', {
            displayStallowner: stallowner,
        })
    })  
})

router.get('/showCreateStall', auth_login.authAdmin, uuid_middleware.generate, (req, res) =>{
    var CurrentDate = moment().format('YYYY-MM-DD');
    res.render('admin/stallCreateModel', {layout: 'empty_layout', maxDate: CurrentDate})
})

router.get('/showLock/:theUserID', auth_login.authAdmin, uuid_middleware.generate, (req, res) =>{
    let stallID = req.params.theUserID  
    User.findOne({where: {id: stallID}}).then((stallowner) =>{
        res.render('admin/lockModel', {layout: 'empty_layout', displayID: stallowner})
    })             
})

router.get('/showUnlock/:theUserID', auth_login.authAdmin, uuid_middleware.generate, (req, res) =>{
    let stallID = req.params.theUserID  
    User.findOne({where: {id: stallID}}).then((stallowner) =>{
        res.render('admin/unlockModel', {layout: 'empty_layout', displayID: stallowner})
    })             
})

router.get('/showDelete/:theUserID', auth_login.authAdmin, uuid_middleware.generate, (req, res) =>{
    let stallID = req.params.theUserID  
    User.findOne({where: {id: stallID}}).then((stallowner) =>{
        res.render('admin/deleteModel', {layout: 'empty_layout', displayID: stallowner})
    })             
})

module.exports = router;
