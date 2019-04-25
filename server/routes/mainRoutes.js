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

module.exports = router