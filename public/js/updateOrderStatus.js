// Init Web Socket
var socket = null;

$(document).ready(function (){

    var sid = subStrCookie(getCookie('connect.sid'))
    //Connect to websocket
    socket = io.connect('http://' + window.location.hostname +':4000/');
    socket.on('connect', () => {
    console.log('Listening for updates'); // true
        socket.emit('sessionid', sid)

        if(typeof getOrderId === "function"){
            //Is a customer on a order status page
            var orderId = getOrderId();
            socket.emit('customer-init', {orderId});
        }


        //Customers events
        socket.on('update-status', function({updatedStatus}){
            console.log(updatedStatus);

            if(updateStatus == 'Collection Confirmed'){
                setCircleProgress(100);
                setTime(0);
            }

            $('#order-status').text(updatedStatus)
            if(typeof notify === "function") notify(updatedStatus);
        })
    
        socket.on('update-timing', function({timing}){
            console.log("Timing: " + timing);
            setTime(timing);
            setCircleProgress((60 - timing) / 60 * 100);
        })
    });
    socket.on('disconnect', () => {
        console.log('Stopped listening for updates');
    })


    

    setTimeout(0);

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

    var STATUS = {
        OrderPending: 'Order Pending',
        PreparingOrder: 'Preparing Order',
        ReadyForCollection: 'Ready for Collection',
        CollectionConfirmed: 'Collection Confirmed'
    }

    var updateBtn = document.getElementById(`updateStatusBtn_${orderID}`)
    var currentStatusCtx = document.getElementById(`currentStatusTxt_${orderID}`)       // Update Send
    var updateStatusCtx = document.getElementById(`updateStatusTxt_${orderID}`)         // Next status aft current status
    var orderCard = document.getElementById(`orderCard_${orderID}`)

    var updatedStatus = null
    var nxtStatus = null

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

function qrUpdateStatus(pOrderId) {
    $.ajax({
        type: "PUT",
        dataType: 'Substring',
        data: pOrderId
    })
}