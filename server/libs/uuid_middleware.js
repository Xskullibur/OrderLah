
const uuidv4 = require('uuid/v4')

const salt = [0xb3, 0x99, 0x7d, 0x47, 0xa8, 0x36, 0x75, 0x0a, 0x38, 0x1b, 0xf6, 0xe9, 0xe7, 0x6d, 0xa1, 0x7b]

/**
 * Check if csrf token is valid from the given session
 * @param {object} session 
 * @param {string} csrf 
 * @param {boolean} removeAfterOneUse - the token will be remove after verification
 */
function verifyFromSession(session, csrf, removeAfterOneUse = true){
    for(let i = 0; i < session.csrfs.length; i++){
        let tcsrf = session.csrfs[i]
        if(tcsrf === csrf){

            if(removeAfterOneUse){
                //Disable token 
                session.csrfs.splice(i, 1)
            }

            return true
        }
    }
    return false
}

module.exports = {
    /**
     * Express middleware for generating uuidv4 id/csrf token for embedding into handlebars
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    generate: function (req, res, next) {
        //Generate token
        let csrf_token = uuidv4(salt)

        if(!req.session.csrfs){
            //Create array for csrf tokens
            req.session.csrfs = []
        }

        req.session.csrfs.push(csrf_token)
        res.locals.csrf = csrf_token
        next()
    },

    /**
     * Express middleware for using existing uuidv4 id/csrf token for embedding into handlebars
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    embed: function (req, res, next) {
        if(req.session.csrfs == undefined || req.session.csrfs.length <= 0){
            console.warn("No CSRF token")
            return
        }
        //Use the first csrf token
        let csrf_token = req.session.csrfs[0]
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
        if(req.session.csrfs){
            let valid = verifyFromSession(req.session, req.body.csrf)
            if(valid){
                //Correct
                next()
                return
            }
            res.status(401)
            res.send('Incorrect CSRF token!')
        }else{
            res.status(401)
            res.send('No CSRF token')
        }

        
    },

    
    /**
     * Register a token as csrf, be careful when using this function
     * @param {*} req 
     * @param {*} token 
     */
    registerToken: function(req, token){
        req.session.csrfs.push(token)
    },


    /**
     * Send CSRF token to client, IMPORTANT: this should be disabled in production
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    debug: function(req,res){
        if(req.session.csrfs == undefined) {
            res.status(400)//Bad request
            res.send('Bad request')
        }
        else{
            res.type('json')
            console.log(req.session.csrfs)
            res.send(JSON.stringify(req.session.csrfs))
        }
    },

    
    verifyFromSession




}