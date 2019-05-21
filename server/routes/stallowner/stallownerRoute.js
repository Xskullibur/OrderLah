const express = require('express')

const router = express.Router()

const fs = require('fs');
const upload = require('./upload');

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

const MenuItem = globalHandle.get('menuItem')

router.get('/showMenu', (req, res) => {
    MenuItem.findAll().then((item) =>{
        res.render('stallowner-menu', {
            item:item
        })
    })

    //res.render('stallowner-menu')
})

router.post('/submitItem', (req, res) =>{
    const itemName = req.body.itemName
    const price = req.body.itemPrice
    const itemDesc = req.body.itemDescription

    if (!fs.existsSync('./public/uploads')){
        fs.mkdirSync('./public/uploads');
    }

    upload(req, res, (err) => {     
        if (err) {
            res.send("error")
        } else {
            if (req.file === undefined) {
                res.send("undefined")
            } else {
                res.json({ file: `/uploads/test` });
            }  
        } 
    })

    MenuItem.create({ itemName, price, itemDesc}).then(function() {
        // alert("Item successfully added")
        res.send('Good')
        //res.render('stallowner-menu')
    }).catch(err => console.log(err))
})

module.exports = router