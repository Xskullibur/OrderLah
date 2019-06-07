// const Server = require('socket.io');
// const io = new Server();

const server = require('http').createServer();

const io = require('socket.io')(server, {
    // serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});


io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('sessionid', function (msg) {
        console.log(msg);
        socket.emit('reply', 'ALSON IS THE GREATEST')
        
    })
    socket.on('disconnect', function(){
        console.log('user disconnected');
      });
});
  

server.listen(4000,() => {
    console.log('Websocket listening on 4000');
    
});