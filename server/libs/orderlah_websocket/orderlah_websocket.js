// const Server = require('socket.io');
// const io = new Server();

const transactions = require('../../utils/main/order_transactions')
const globalHandle = require('../global/global')

const order_util = require('../../utils/stallowner/order')
const stall_util = require('../../utils/stallowner/stall')
const update_util = require('../../utils/stallowner/update_status')

const server = globalHandle.get('server')

const io = require('socket.io')(server);

// , {
//     // serveClient: true,
//     // below are engine.IO options
//     pingInterval: 10000,
//     pingTimeout: 5000,
//     cookie: false
// }


RedisStore = globalHandle.get('redis')

const sessionIDs = {}

io.on('connection', function(socket){

    console.log(socket.id);
    console.log('a user connected');
    
    // On User Connect
    socket.on('sessionid', function (msg) {
        console.log(msg);
        var sessionId = msg

        //Store session id with socket id
        sessionIDs[socket.id] = sessionId
        //io.to(socket.id) get socket
    })

    /**
     * Customer will send the order id upon connecting to socket
     */
    socket.on('customer-init', function({publicOrderId}) {


        order_util.getOrderFromPublicOrderID(publicOrderId).then(order =>{

            let orderId = order.id

            let sessionid = sessionIDs[socket.id]

            getSessionBySessionID(sessionid, async (err, session) => {
                if(session.passport.user){
                    let valid = await order_util.checkOrderIsInUser(session.passport.user, orderId)
                    
                    stall_util.getStallIDFromOrderID(orderId).then((stallId) => {
                
                        if(valid)sendTiming(stallId[0].stallId)//stallowner socket 
                        
                    })

                    
                }
            })
        })

    })
    
    // On User Disconnect
    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete sessionIDs[socket.id] 
    });

    // Customers events
    socket.on('', function(){ })

    var STATUS = {
        OrderPending: 'Order Pending',
        PreparingOrder: 'Preparing Order',
        ReadyForCollection: 'Ready for Collection',
        CollectionConfirmed: 'Collection Confirmed'
    }

    // Stallowners events
    // [On Update Order Status]
    socket.on('update-status', async function({publicOrderId, qrcode}) {

        //Update customer timing
        getSessionBySessionID(sessionIDs[socket.id], async (err, stallownerSession) => {
            let stallownerId = stallownerSession.passport.user
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
        
        socket.emit('update-status-complete', {publicOrderId, updatedStatus, nxtStatus, errorMsg})

    })

});

function sendOrderToStallOwner(stallId, order){
    getSessionsFromUserID(stallId, (sessionId, session)  => {
        getSocketIDsBySessionID(sessionId, (socketId) => {
            socketIds.forEach(socketId => {
                io.to(socketId).emit('add-order', {
                    order: JSON.stringify(order)
                })
                
            });

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

function getSocketIDBySessionID(sessionId){
    for (let socketId in sessionIDs) {
        let tsessionId = sessionIDs[socketId]
        if(sessionId == tsessionId)return socketId
    }
    return null
}

function getSocketIDsBySessionID(sessionId, yieldCB){
    for (let socketId in sessionIDs) {
        let tsessionId = sessionIDs[socketId]
        if(sessionId == tsessionId)yieldCB(socketId)
    }
}

// function getSocketIDsBySessionID(sessionId){
//     let socketIds = []
//     for(let socketId in sessionIDs){
//         if(sessionIDs[socketId] == sessionId)socketIds.push(socketId)
//     }
//     return socketIds
// }

function getSessionsFromUserID(userId, yieldCB){
    for(let socketId in sessionIDs){
        let sessionId = sessionIDs[socketId]
        getSessionBySessionID(sessionId, (err, session) => {
            if(!err && session.passport.user === userId){
                yieldCB(sessionId, session);
            }
        })
    }
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

module.exports = {sendOrderToStallOwner}