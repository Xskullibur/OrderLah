const express = require('express')

const router = express.Router()

// Uploads for menu item
const fs = require('fs');
const multer = require('multer')
const storage = require('./upload');
const upload = multer({storage : storage })

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

router.use(auth_login.auth)

router.get('/showMenu', (req, res) => {
    MenuItem.findAll().then((item) =>{
        res.render('stallowner-menu', {
            item:item
        })
    })

    //res.render('stallowner-menu')
})



router.post('/submitItem', upload.single("itemImage"), (req, res) =>{
    const itemName = req.body.itemName
    const price = req.body.itemPrice
    const itemDesc = req.body.itemDescription

    if (!fs.existsSync('./public/uploads')){
        fs.mkdirSync('./public/uploads');
    }

    

    MenuItem.create({ itemName, price, itemDesc}).then(function() {
        // alert("Item successfully added")
        res.send('Good')
        //res.render('stallowner-menu')
    }).catch(err => console.log(err))
})

module.exports = router