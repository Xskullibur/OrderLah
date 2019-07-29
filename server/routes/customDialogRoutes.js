/**
 * Define all dynamically inserted dialog html 
 */

const express = require('express')
//Create router
const router = express.Router()

/**
 * GET 'sample'
 * Send sample dialog html
 */
router.get('/sample', (req, res)=>{
    res.render('customDialogs/sample', {layout: 'empty_layout'})
})

module.exports = router
