const express = require('express')
//Create router
const router = express.Router()

//Define main 'route' path

/**
 * Default GET '/' path
 */
router.get('/', (req, res) => {
    res.render('index')
})

/**
 * Login GET '/login' path
 */
router.get('/login', (req, res) => {
    res.render('login', {layout: 'blank_layout'})
})

module.exports = router