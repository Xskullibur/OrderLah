// Init Web Socket
var socket = null;

$(document).ready(function (){

    var sid = subStrCookie(getCookie('connect.sid'))
    //Connect to websocket
    socket = io.connect(window.location.protocol + '//' + window.location.hostname +':3000/');
    socket.on('connect', () => {
    console.log('Listening for updates'); // true
        socket.emit('sessionid', sid)

        if(typeof getPublicOrderId === "function"){
            //Is a customer on a order status page
            var publicOrderId = getPublicOrderId();
            socket.emit('customer-init', {publicOrderId});
        }

        //Customers events
        socket.on('update-status', function({updatedStatus}){
            console.log(updatedStatus);

            if(updatedStatus.valueOf() == 'Collection Confirmed'){
                $('#while-order').addClass('d-none');
                if(!$(".trigger").hasClass('drawn'))$(".trigger").addClass("drawn");
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

        socket.on('update-status-complete', function({publicOrderId, updatedStatus, nxtStatus, errorMsg}){
            
            if (errorMsg != "") {
                showAlert(errorMsg, 3000, "alert-warning")
            }
            else{
    
                var orderCard = document.getElementById(`orderCard_${publicOrderId}`)
    
                // Remove Card if updatedStatus = "Collection Confirmed"
                if (updateStatus == "Collection Confirmed") {
                    orderCard.parentNode.removeChild(orderCard)
                }
                else{
    
                    var updateBtn = document.getElementById(`updateStatusBtn_${publicOrderId}`)
                    var currentStatusCtx = document.getElementById(`currentStatusTxt_${publicOrderId}`)       // Update Send
                    var updateStatusCtx = document.getElementById(`updateStatusTxt_${publicOrderId}`)         // Next status aft current status    
    
                    // Update Current Status with Updated Status
                    currentStatusCtx.innerHTML = updatedStatus
    
                    if (nxtStatus !== null) {
                        updateStatusCtx.innerHTML = nxtStatus   
                    }
                }
            
                // Check order container for any orders
                orderContainer = document.getElementById("orderContainer")
            
                if (orderContainer.childElementCount === 0) {
                    orderContainer.innerHTML = `<div class="alert alert-success m-5" role="alert">
                    <h4 class="alert-heading">Well Done!</h4>
                    <p>There are no more orders left.</p>
                    </div>`
                }
            
            }
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
function updateStatus(publicOrderId, qrcode=false) {

    // Send websocket (update-status) || Update DB
    socket.emit('update-status', {publicOrderId, qrcode})

}