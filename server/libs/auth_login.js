/**
 * Middleware which check if the user is logged in by checking if the req.user is null
 */


module.exports = {
    auth: function(req, res, next){
        console.log(process.env.NODE_ENV)
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
    }
}