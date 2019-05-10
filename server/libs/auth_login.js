/**
 * Middleware which check if the user is logged in by checking if the req.user is null
 */

module.exports = {
    auth: function(req, res, next){
        if(req.user !== null && req.user !== undefined) {
            //User is logged in
            next()
        }else {
            //User is not login
            res.status(404)
            res.send('Not logged in!')
        } 
    }
}