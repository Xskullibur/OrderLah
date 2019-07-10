// const Server = require('socket.io');
// const io = new Server();

const status =require('../../utils/stallowner/update_status')
const transactions = require('../../utils/main/order_transactions')
const server = require('http').createServer();

const io = require('socket.io')(server, {
    // serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

const globalHandle = require('../global/global')
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
    socket.on('update-status', function({orderID, updatedStatus}) {

        status.updateOrderStatus({
            orderID, updatedStatus
        }).then((result) => {
            console.log(`Success: ${result}`)
            transactions.getCustomerByOrderID(orderID).then(orderCust => {
                getSessionsFromCustomerID(orderCust.user.id, (sessionid, session) => {
                    const socketid = getSocketIDBySessionID(sessionid)
                    io.to(socketid).emit('update-status', {updatedStatus})
                })
            })
        }).catch((err) => {
            console.log(`Error: ${err}`)
        });

    })

});
  

server.listen(4000,() => {
    console.log('Websocket listening on 4000');
    
});

function getSocketIDBySessionID(sessionId){
    for (let socketId in sessionIDs) {
        let tsessionId = sessionIDs[socketId]
        if(sessionId == tsessionId)return socketId
    }
    return null
}

function getSessionsFromCustomerID(custId, yieldCB){
    for(var socketId in sessionIDs){
        var sessionId = sessionIDs[socketId]
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