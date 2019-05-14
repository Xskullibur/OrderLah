const express = require('express')

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

const MenuItem = globalHandle.get('menuItem')

router.get('/showMenu', (req, res) => {
    res.render('stallowner-menu')
})

router.post('/submitItem', (req, res) =>{
    const itemName = req.body.itemName
    const price = req.body.itemPrice
    const itemDesc = req.body.itemDescription

    MenuItem.create({ itemName, price, itemDesc}).then(function() {
        // alert("Item successfully added")
        res.send('Good')
    }).catch(err => console.log(err))
})

module.exports = router