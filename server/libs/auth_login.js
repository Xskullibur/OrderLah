/**
 * Middleware which check if the user is logged in by checking if the req.user is null
 */


module.exports = {
    /**
     * Express middleware for logged in user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    auth: function(req, res, next){
        //Dev
        if(process.env.NODE_ENV === 'dev') {

            if(process.env.AUTO_LOGIN  === 'YES'){
                console.warn("Warning: you are auto login as a customer, to disable auto login. Set the Environment variable 'AUTO_LOGIN' to other values then 'YES'");
                
                const globalHandle = require('./global/global')
                const User = globalHandle.get('user')

                User.findOne({where: {email: process.env.LOGIN_AS}}).then(cust => {
                    req.user = cust
                    res.locals.user = cust
                    res.locals.isCustomer = true
                    next()
                })
                return
            }else{
                next()
                return
            }

            
            
        }

        if(req.user !== null && req.user !== undefined) {
            //User is logged in
            next()
        }else {
            //User is not login
            res.status(404)
            res.send('Not logged in!')
        } 
    },
    
    /**
     * Express middleware for user is stallowner
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    authStallOwner: function(req, res, next){
        //Dev
        if(process.env.NODE_ENV === 'dev') {

            //Auto login
            if(process.env.AUTO_LOGIN  === 'YES' && process.env.LOGIN_AS === 'stallowner'){
                console.warn("Warning: you are auto login as a stallowner, to disable auto login. Set the Environment variable 'AUTO_LOGIN' to other values then 'YES'");
                const globalHandle = require('./global/global')
                const User = globalHandle.get('user')

                User.findOne({where: {email: process.env.LOGIN_AS}}).then(stallowner => {
                    req.user = stallowner
                    res.locals.user = stallowner
                    res.locals.isCustomer = false
                    next()
                })
                return
            }else{
                next()
                return
            }
        }

        if(req.user !== null && req.user !== undefined && req.user.role === 'Stallowner') {
            //User is logged in and is stall owner
            next()
        }else {
            //User is not login or is not a stall owner
            res.status(403)
            res.render('error')
        } 
    },

     /**
     * Express middleware for user is admin
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    authAdmin: function(req, res, next){
        //Dev
        if(process.env.NODE_ENV === 'dev') {
            next()
            return
        }

        if(req.user !== null && req.user !== undefined && req.user.role === 'Admin') {
            //User is logged in and is stall owner
            next()
        }else {
            //User is not login or is not a stall owner
            res.status(403)
            res.render('error')
        } 
    }
}