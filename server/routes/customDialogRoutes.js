/**
 * Define all dynamically inserted dialog html 
 */

const express = require('express')
//Create router
const router = express.Router()

//Login authentication middleware
const auth_login = require('../libs/auth_login')

router.use(auth_login.auth)

/**
 * GET 'sample'
 * Send sample dialog html
 */
router.get('/sample', (req, res)=>{
    res.render('customDialogs/sample', {layout: 'empty_layout'})
})

module.exports = router
