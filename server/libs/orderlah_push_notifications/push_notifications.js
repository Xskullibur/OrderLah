const webpush = require('web-push')

const vapidConfig = require('../../../.push/vapid.json')

webpush.setVapidDetails(vapidConfig.subject, vapidConfig.publicKey, vapidConfig.privateKey)

module.exports = function(app){
    //Create push notification endpoint

    app.post('/subscribe', (req, res) => {
        const subscription = req.body
        res.status(201).json({})

        const payload = JSON.stringify({title: 'test'})

        console.log(subscription)

        webpush.sendNotification(subscription, payload).catch(err => {
            console.log(err)
        })

    })

}