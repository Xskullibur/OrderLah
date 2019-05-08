
const uuidv4 = require('uuid/v4')

const salt = [0xb3, 0x99, 0x7d, 0x47, 0xa8, 0x36, 0x75, 0x0a, 0x38, 0x1b, 0xf6, 0xe9, 0xe7, 0x6d, 0xa1, 0x7b]

module.exports = {
    /**
     * Express middleware for generating uuidv4 id for embedding into handlebars
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    generate: function (req, res, next) {
        //Generate token
        let csrf_token = uuidv4(salt)
        req.session.csrf = csrf_token
        res.locals.csrf = csrf_token
        next()
    },

    /**
     * Express middleware for checking id
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    verify: function (req, res, next) {
        //Check token
        if(req.session.csrf === req.body.csrf){
            //Correct
            next()
        }else{
            res.send('Incorrect CSRF token!')
        }
    }

}