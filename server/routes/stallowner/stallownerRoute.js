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

router.use(auth_login.authStallOwner)

router.get('/showMenu', (req, res) => {
    const id = req.user.id
    User.findOne({ where: id }).then(user => {
        if (user.role === 'Admin') {
            MenuItem.findAll({where: { active: true}}).then((item) =>{
                res.render('stallowner-menu', {
                    item:item
                })
            })
        }else if(user.role === 'Stallowner'){
            MenuItem.findAll({where: {owner: req.user.id, active: true}}).then((item) =>{
                res.render('stallowner-menu', {
                    item:item
                })
            })      
        }else{
            res.render('error')
        }      
      })
    



    //res.render('stallowner-menu')
})

router.get('/adminPanel', (req, res) =>{
    User.findAll({where: {role: "Stallowner"}}).then((stallowner) =>{
        res.render('admin', {
            displayStallowner: stallowner
        })
    })
})



router.post('/submitItem', upload.single("itemImage"), (req, res) =>{
    const itemName = req.body.itemName
    const price = req.body.itemPrice
    const itemDesc = req.body.itemDescription
    const owner = req.user.id
    const active = true

    if (!fs.existsSync('./public/uploads')){
        fs.mkdirSync('./public/uploads');
    }

    

    MenuItem.create({ itemName, price, itemDesc, owner, active}).then(function() {
        // alert("Item successfully added")
        //res.send('Good')
        res.render('createSuccess')
    }).catch(err => console.log(err))
})

router.post('/deleteItem', (req, res) =>{
    const active = false
    const id = req.user.id
    MenuItem.update({active}, {where: id}).then(
    function(){res.send('item removed')}).catch(err => console.log(err))
    
})

// router.post('/updateItem', upload.single("itemImage"), (req, res) =>{
//     const itemName = req.body.itemName
//     const price = req.body.itemPrice
//     const itemDesc = req.body.itemDescription

//     MenuItem.update({itemName, price, itemDesc},{where:{id: req.body.id}})
// })

module.exports = router