/**
 * Define all dynamically inserted dialog html 
 */

const express = require('express')
//Create router
const router = express.Router()

//Login authentication middleware
const auth_login = require('../libs/auth_login')

router.use(auth_login.auth)

// Utils
const orderUtil = require('../utils/stallowner/order')
const menuUtil = require('../utils/main/menu_item')

/**
 * GET 'sample'
 * Send sample dialog html
 */
router.get('/sample', (req, res)=>{
    res.render('customDialogs/sample', {layout: 'empty_layout'})
})

router.get('/itemDesc', async (req, res) => {
    if (req.query.id) {
        
        var menuItemId = req.query.id
        
        // Get Menu Item
        menuItem = await menuUtil.getMenuItemByID(menuItemId)

        orderUtil.getMenuItemRatings(menuItemId).then(([ratings, _]) => {
            res.render('customDialogs/item_desc_dialog', {layout: 'empty_layout', menuItem, ratings})
        })

    }
})

module.exports = router
