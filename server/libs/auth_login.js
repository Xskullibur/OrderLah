/**
 * Middleware which check if the user is logged in by checking if the req.user is null
 */


module.exports = {
    auth: function(req, res, next){
        //Dev
        if(process.env.NODE_ENV === 'dev') {
            next()
            return
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
     * Express middleware for checking id
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    authStallOwner: function(req, res, next){
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