
/**
 * Set error and success message alert
 */
module.exports = function (req, res, next){
    if(!req.session.alerts) {
        next()
        return
    }
    res.locals.alerts = []
    for(let alert of req.session.alerts){
        if(!alert.displayed){
            let localAlert = alert
            localAlert.type = alert.type || 'alert-success'
            localAlert.timeout = alert.timeout || 3000
            res.locals.alerts.push(localAlert)
        }
        alert.displayed = true
    }
    next()
}