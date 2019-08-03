// const Server = require('socket.io');
// const io = new Server();

const transactions = require('../../utils/main/order_transactions')
const globalHandle = require('../global/global')

const order_util = require('../../utils/stallowner/order')
const stall_util = require('../../utils/stallowner/stall')
const update_util = require('../../utils/stallowner/update_status')

const server = globalHandle.get('server')

const io = require('socket.io')(server);

const helpers = require('../../helpers/helpers')

//Notifications
const webpush = globalHandle.get('webpush')
const client = globalHandle.get('redis-client')
// , {
//     // serveClient: true,
//     // below are engine.IO options
//     pingInterval: 10000,
//     pingTimeout: 5000,
//     cookie: false
// }
const redis = require('redis')
RedisStore = globalHandle.get('redis-store')

io.on('connection', function(socket){

    console.log(socket.id);
    console.log('a user connected');
    
    // On User Connect
    socket.on('sessionid', function ({sessionId, csrf}) {
        console.log(sessionId);

        //Store session id with socket id
        storeSocketIdForSessionId(socket.id, sessionId)
        storeSessionIdForSocketId(socket.id, sessionId)

        client.get('socketToSession:'+socket.id, async function(err, sessionId){
            getSessionBySessionID(sessionId, async (err, session) => {
                let valid = verifyCSRFTokenFromSession(session, csrf)
                if(!valid){
                    socket.disconnect(true)
                    return 
                }
            })
        })

    })

    /**
     * Customer will send the order id upon connecting to socket
     */
    socket.on('customer-init', function({publicOrderId, csrf}) {

        client.get('socketToSession:'+socket.id, async function(err, sessionId){
            getSessionBySessionID(sessionId, async (err, session) => {

            let valid = verifyCSRFTokenFromSession(session, csrf)
            if(!valid){
                socket.disconnect(true)
                return 
            }

            order_util.getOrderFromPublicOrderID(publicOrderId).then(async order =>{

                let orderId = order.id
                    if(session.passport.user){
                        let valid = await order_util.checkOrderIsInUser(session.passport.user, orderId)
                        
                        stall_util.getStallIDFromOrderID(orderId).then((stallId) => {
                    
                            if(valid)sendTiming(stallId[0].stallId)//stallowner socket 
                            
                        })
    
                        
                    }
                })
            })
        })

    })
    
    // On User Disconnect
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    var STATUS = {
        OrderPending: 'Order Pending',
        PreparingOrder: 'Preparing Order',
        ReadyForCollection: 'Ready for Collection',
        CollectionConfirmed: 'Collection Confirmed'
    }

    // Stallowners events
    // [On Update Order Status]
    socket.on('update-status', async function({publicOrderId, qrcode, csrf}) {

        let stallownerId = null

        //Update customer timing
        client.get('socketToSession:'+socket.id, async function(err, sessionId){
            await getSessionBySessionID(sessionId, async (err, stallownerSession) => {

                //Check 
                let valid = verifyCSRFTokenFromSession(stallownerSession, csrf)
                if(!valid){
                    socket.disconnect(true)
                    return 
                }

                stallownerId = stallownerSession.passport.user
                let stallOwner = await order_util.getStallInfo(stallownerId)
    
                let stallId = stallOwner.stall.id
    
                sendTiming(stallId)
            })
    
            // Get Order Id from Public Order Id
            let order = await order_util.getOrderFromPublicOrderID(publicOrderId)
            let orderID = order.id
            updatedStatus = null
            nxtStatus = null
            errorMsg = ""
        
            // Get Current Status from Order Id
            let currentStatus = await update_util.getCurrentStatus(orderID)
        
            // Check if called from QR Code (Inital Status = 'Ready for Collection')
            if (qrcode) {
                if (currentStatus != STATUS.ReadyForCollection) {
                    errorMsg = "Order not ready for collection!"
                }
            }
        
            // Get updated status
            switch (currentStatus) {
                case STATUS.OrderPending:
                    updatedStatus = STATUS.PreparingOrder
                    nxtStatus = STATUS.ReadyForCollection
                    break;
        
                case STATUS.PreparingOrder:
                    updatedStatus = STATUS.ReadyForCollection
                    nxtStatus = STATUS.CollectionConfirmed
                    break;
        
                case STATUS.ReadyForCollection:
                    updatedStatus = STATUS.CollectionConfirmed
                    break;
            
                default:
                    errorMsg = "Invalid Order Status!"
                    break;
            }
        
            // Update and redirect if no errorMsg
            if (errorMsg == "") {
    
                update_util.updateOrderStatus({
                    orderID, updatedStatus
                }).then((result) => {
                    console.log(`\nUpdating order id of ${orderID} to ${updatedStatus}`)
                    transactions.getCustomerByOrderID(orderID).then(orderCust => {
                        getSessionsFromUserID(orderCust.user.id, (sessionid, session) => {
                            getSocketIDsBySessionID(sessionid, (socketId) => {
                                console.log(`Sending order update to socket id of ${socketId} which equate to session id: ${sessionid}`);
                                
                                io.to(socketId).emit('update-status', {updatedStatus})
                                
                                //Send push notications
                                client.get('subscription:' + sessionid, function(err, subscription){
                                    const payload = JSON.stringify({title:'Hey, there is an update to your order!',
                                     body:`Your Order: ${orderID} is in status: ${updatedStatus}`})
    
                                    console.log(subscription)
    
                                    webpush.sendNotification(JSON.parse(subscription), payload).catch(err => {
                                        console.log(err)
                                    })
                                })
                                
    
                            })
                        })
                    })
                }).catch((err) => {
                    console.log(`errorMsg: ${err}`)
                });
    
            }
            else{
                console.log(errorMsg)
            }
            
            // socket.emit('update-status-complete', {publicOrderId, updatedStatus, nxtStatus, errorMsg})
    
            // Get all stallowner's socket id
            getSessionsFromUserID(stallownerId, (sessionId) => {
                getSocketIDsBySessionID(sessionId, (socketId) => {
                    io.to(socketId).emit('update-status-complete', {publicOrderId, updatedStatus, nxtStatus, errorMsg})
                })
            })
        })
        

    })

});

async function sendOrderToStallOwner(stallId, orderDetails){

    const stall = await stall_util.getStallFromStallID(stallId)
    const userId = stall.userId

    getSessionsFromUserID(userId, (sessionId, session)  => {
        getSocketIDsBySessionID(sessionId, (socketId) => {
            io.to(socketId).emit('add-order', {
                orderDetails
            })
        })
    })
}

function sendTiming(stallId){
    //Update customer timing
    stall_util.getAllPendingCustomersIDByStallID(stallId).then(custIds => {
        custIds.forEach(custId => {

            let userID = custId.userId

            getSessionsFromUserID(userID, (sessionId) => {
                getSocketIDsBySessionID(sessionId, (socketId) => {
                    order_util.getOrderIDFromUserId(userID).then(orderId => {
                    
                        getOrderTimingForOrder(orderId[0].id, (timing => {
                            io.to(socketId).emit('update-timing', {timing})
                        }))
    
                    })
                })
            })

        })            
    })
}

function getOrderTimingForOrder(orderid, cb){
    const timingForEachOrder = 2
    order_util.getNumberOfOrdersBeforeOrder(orderid).then(count => {
        cb(count[0].ordersCount * timingForEachOrder)
    })
}

function getSocketIDsBySessionID(sessionId, yieldCB){
    client.get('sessionToSockets:' + sessionId, function(err, socketIds){
        if(socketIds){
            socketIds = JSON.parse(socketIds)
            socketIds.forEach(socketId => {
                yieldCB(socketId)

            })
        }
    })
}

function getSessionsFromUserID(userId, yieldCB){
    client.get('userToSessions:' + userId, function(err, sessionIds){
        if(!err){
            if(sessionIds){
                sessionIds = JSON.parse(sessionIds)
                sessionIds.forEach(sessionId => {
                    getSessionBySessionID(sessionId, (err, session) => {
                        yieldCB(sessionId, session);
                    })
                })
            }
        }
    })
}

function getSessionBySessionID(sessionId, cb){
    //Retrieve the session store inside redis
    RedisStore.get(sessionId, (err, session) => {
        if (err) {
            console.log(err);
            cb(err, null)
        }
        else{
            if (session) {
                console.log(session);
                cb(null, session)
            }
            else{
                console.log("Error");
                cb('Empty', null)
            }
        }

    })
}


function storeSocketIdForSessionId(socketId, sessionId){
    client.set('socketToSession:' + socketId,  sessionId, redis.print)

    //Store userid as well
    getSessionBySessionID(sessionId, (err, session) => {
        if (session !== null && session.passport.user) {
            storeUserIdForSessionId(session.passport.user, sessionId)
        }
    })
}

function storeUserIdForSessionId(userId, sessionId){
    client.get('userToSessions:' + userId, function(err, sessionIds){
        sessionIds = JSON.parse(sessionIds)
        if(!err){
            if(sessionIds == null){
                client.set('userToSessions:' + userId, JSON.stringify([]), redis.print)
                storeUserIdForSessionId(userId, sessionId)
            }else if(!sessionIds.includes(sessionId)){
                sessionIds.push(sessionId)
                client.set('userToSessions:' + userId, JSON.stringify(sessionIds), redis.print)
            }
        }
    })
}

function storeSessionIdForSocketId(socketId, sessionId){
    client.get('sessionToSockets:' + sessionId, function(err, socketIds){
        socketIds = JSON.parse(socketIds)
        if(!err){
            if(socketIds == null){
                client.set('sessionToSockets:' + sessionId, JSON.stringify([]), redis.print)
                storeSessionIdForSocketId(socketId, sessionId)
            }else if(!socketIds.includes(socketId)){
                socketIds.push(socketId)
                client.set('sessionToSockets:' + sessionId, JSON.stringify(socketIds), redis.print)
            }
        }
    })
}

const uuid_middleware = require('../uuid_middleware')
function verifyCSRFTokenFromSession(session, csrf){
    let valid = uuid_middleware.verifyFromSession(session, csrf, false)
    return valid
}

module.exports = {sendOrderToStallOwner}