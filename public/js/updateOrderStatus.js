// Init Web Socket
var socket = null;

// Save session id to redis
$(document).ready(function (){                          
    var sid = subStrCookie(getCookie('connect.sid'))
    console.log(sid)
    //Connect to websocket
    socket = io('http://localhost:4000/');
    socket.on('connect', () => {
    console.log(socket.connected); // true
        socket.emit('sessionid', sid)
        socket.on('reply', function(reply){
            console.log(reply);
        })
    });
})

// Get Session ID from Cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Substring Session ID
function subStrCookie(cookie){
    var pattern = /:(.+)\./;
    return pattern.exec(cookie)[1];
}

// Update Status
function updateStatus(orderID) {

    const STATUS = {
        OrderPending: 'Order Pending',
        PreparingOrder: 'Preparing Order',
        ReadyForCollection: 'Ready for Collection',
        CollectionConfirmed: 'Collection Confirmed'
    }

    let updateBtn = document.getElementById(`updateStatusBtn_${orderID}`)
    let currentStatusCtx = document.getElementById(`currentStatusTxt_${orderID}`)       // Update Send
    let updateStatusCtx = document.getElementById(`updateStatusTxt_${orderID}`)         // Next status aft current status
    let orderCard = document.getElementById(`orderCard_${orderID}`)

    let updatedStatus = null
    let nxtStatus = null

    //Update Status
    switch (updateBtn.innerText) {

        case STATUS.PreparingOrder:
            updatedStatus = STATUS.PreparingOrder
            nxtStatus = STATUS.ReadyForCollection
            break

        case STATUS.ReadyForCollection:
            updatedStatus = STATUS.ReadyForCollection
            nxtStatus = STATUS.CollectionConfirmed
            break

        case STATUS.CollectionConfirmed:
            updatedStatus = STATUS.CollectionConfirmed
            orderCard.parentNode.removeChild(orderCard)
            break

    }

    if (nxtStatus !== null) {
        updateStatusCtx.innerHTML = nxtStatus   
    }

    currentStatusCtx.innerHTML = updatedStatus

    // Send websocket (update-status)
    socket.emit('update-status', {orderID, updatedStatus})

    // Check order container for any orders
    orderContainer = document.getElementById("orderContainer")

    if (orderContainer.childElementCount === 0) {
        orderContainer.innerHTML = `<div class="alert alert-success m-5" role="alert">
        <h4 class="alert-heading">Well Done!</h4>
        <p>There are no more orders left.</p>
        </div>`
    }

}