const globalHandle = require('../global/global')
const vapidConfig = require('../../../.push/vapid.json')
const webpush = require('web-push')

webpush.setVapidDetails(vapidConfig.subject, vapidConfig.publicKey, vapidConfig.privateKey)
globalHandle.put('webpush', webpush)


const client = globalHandle.get('redis-client')

module.exports = function(app){
    //Create push notification endpoint

    app.post('/subscribe', (req, res) => {
        const subscription = req.body

        client.set('subscription:' + req.session.id, JSON.stringify(subscription), function(err, reply) {
            console.log(reply);
        })

        res.status(201).json({})

        // const payload = JSON.stringify({title: 'test'})

        // console.log(subscription)

        // webpush.sendNotification(subscription, payload).catch(err => {
        //     console.log(err)
        // })

    })

}
