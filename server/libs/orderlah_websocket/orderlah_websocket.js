// const Server = require('socket.io');
// const io = new Server();

const status = require('../../utils/stallowner/update_status')
const transactions = require('../../utils/main/order_transactions')
const globalHandle = require('../global/global')
const order_util = require('../../utils/stallowner/order')
const stall_util = require('../../utils/stallowner/stall')

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
    socket.on('customer-init', function({orderId}) {

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
    
    // On User Disconnect
    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete sessionIDs[socket.id] 
    });

    // Customers events
    socket.on('', function(){

    })

    // Stallowners events
    // [On Update Order Status]
    socket.on('update-status', async function({orderID, updatedStatus}) {

        //Update customer timing
        getSessionBySessionID(sessionIDs[socket.id], async (err, stallownerSession) => {
            let stallownerId = stallownerSession.passport.user
            let stallOwner = await order_util.getStallInfo(stallownerId)

            let stallId = stallOwner.stall.id

            sendTiming(stallId)
            

        })

        status.updateOrderStatus({
            orderID, updatedStatus
        }).then((result) => {
            console.log(`Updating order id of ${orderID} to ${updatedStatus}`)
            transactions.getCustomerByOrderID(orderID).then(orderCust => {
                getSessionsFromCustomerID(orderCust.user.id, (sessionid, session) => {
                    const socketid = getSocketIDBySessionID(sessionid)
                    console.log(`Sending order update to socket id of ${socketid} which equate to session id: ${sessionid}`);
                    
                    io.to(socketid).emit('update-status', {updatedStatus})
                })
            })
        }).catch((err) => {
            console.log(`Error: ${err}`)
        });

    })

});

function sendTiming(stallId){
    //Update customer timing
    stall_util.getAllPendingCustomersIDByStallID(stallId).then(custIds => {
        custIds.forEach(custId => {

            let userID = custId.userId

            getSessionsFromCustomerID(userID, (session) => {
                let socketids = getSocketIDsBySessionID(session)

                order_util.getOrderIDFromUserId(userID).then(orderId => {
                    
                    getOrderTimingForOrder(orderId[0].id, (timing => {
                        socketids.forEach(socketId => {
                            io.to(socketId).emit('update-timing', {timing})
                        })
                    }))

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

function getSocketIDsBySessionID(sessionId){
    let socketIds = []
    for(let socketId in sessionIDs){
        if(sessionIDs[socketId] == sessionId)socketIds.push(socketId)
    }
    return socketIds
}

function getSessionsFromCustomerID(custId, yieldCB){
    for(let socketId in sessionIDs){
        let sessionId = sessionIDs[socketId]
        getSessionBySessionID(sessionId, (err, session) => {
            if(!err && session.passport.user === custId){
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