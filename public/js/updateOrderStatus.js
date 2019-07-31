// Init Web Socket
var socket = null;

$(document).ready(function (){

    var sessionId = subStrCookie(getCookie('connect.sid'))
    //Connect to websocket
    socket = io.connect(window.location.protocol + '//' + window.location.hostname +':3000/');
    socket.on('connect', () => {
    console.log('Listening for updates'); // true
        socket.emit('sessionid', {sessionId, csrf: $('#csrf-token').val()})

        if(typeof getPublicOrderId === "function"){
            //Is a customer on a order status page
            var publicOrderId = getPublicOrderId();
            socket.emit('customer-init', {publicOrderId, csrf: $('#csrf-token').val()});
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

        //Stall owner events
        socket.on('update-status-complete', function({publicOrderId, updatedStatus, nxtStatus, errorMsg}){
            
            if (errorMsg != "") {
                showAlert(errorMsg, 3000, "alert-warning")
            }
            else{
    
                var orderCard = document.getElementById(`orderCard_${publicOrderId}`)
                
                // Remove Card if updatedStatus = "Collection Confirmed"
                if (updatedStatus == "Collection Confirmed") {
                    $(`#orderCard_${publicOrderId}`).remove()
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
                orderContainer = document.getElementById("all-orders-column")
            
                if (orderContainer.childElementCount === 0) {
                    $('#card-view').append(`<div class="alert alert-success m-5" role="alert" id="no_order_msg">
                    <h4 class="alert-heading">Well Done!</h4>
                    <p>There are no more orders left.</p>
                    </div>`)
                }
            
            }

        })

        socket.on('add-order', function({orderDetails}) {
            var all_orders_column = document.getElementById('all-orders-column')
    
            if (orderDetails) {
    
                const pOrderId = substringTo5(orderDetails.publicOrderID)
                const formattedOrderTiming = formatDate(orderDetails.orderTiming, "HH:MM:SS")
                const nxtOrderStatus = getNextStatus(orderDetails.status)
                const orderTotal = calcOrderTotal(orderDetails)
        
                var order_items = ""
        
                for (const orderItem in orderDetails.menuItems) {
                    if (orderDetails.menuItems.hasOwnProperty(orderItem)) {
        
                        const menuItem = orderDetails.menuItems[orderItem];
                        order_items += `                
                        <div class="row font-weight-light">
                            <div class="col-md-auto">
                                ${menuItem.itemName}
                            </div>
                            <div class="col text-right">
                                <span class="badge badge-secondary">x${menuItem.orderItem.quantity}</span>
                            </div>
                        </div>`
        
                    }
                }
    
                var card = `   
                <div class="d-inline-block p-3">                                         
                <div class="card shadow-sm" id="orderCard_${orderDetails.publicOrderID}" style="width: 15rem">
    
                    <div class="card-header font-weight-bold bg-danger text-right text-white">
                        <div class="row justify-content-between">
                            <div class="col">
                                <h7>Order: ${pOrderId}</h7>
                            </div>
                        </div>
                        <div class="row justify-content-between">
                            <div class="col">
                                <h6>${formattedOrderTiming}</h6>
                            </div>
                        </div>
                    </div>
    
                    <div class="card-body" style="font-family: Roboto">
    
                        <div class="row">
                            <div class="col">
                                <div class="row">
                                    <u class="mx-auto">Current Status:</u>
                                </div>
                                <div class="row">
                                    <b class="mx-auto" id="currentStatusTxt_${orderDetails.publicOrderID}">${orderDetails.status}</b>
                                </div>
                            </div>
                        </div>
    
                        <hr>
    
                        ${order_items}
    
                        <hr>

                        <div class="row">
                            <div class="col text-right">
                                $${orderTotal}   
                            </div>
                        </div>
    
                    </div>
    
                    <div class="card-footer text-muted">
                        <div class="row">
                            <form action="./updateStatus/${orderDetails.publicOrderID}" method="post" class="mx-auto">
    
                                <button type="button" onclick="updateStatus('${orderDetails.publicOrderID}');" id="updateStatusBtn_${orderDetails.publicOrderID}" class="btn btn-sm btn-outline-primary mx-auto">
                                    <b id="updateStatusTxt_${orderDetails.publicOrderID}">${nxtOrderStatus}</b>
                                </button>
                                
                            </form>
                        </div>
                    </div>
                </div>
                </div>`
    
                all_orders_column.innerHTML += card

                $('#no_order_msg').remove()
            }
    
        })
    });
    socket.on('disconnect', () => {
        console.log('Stopped listening for updates');
    })

    setTimeout(0);

})

// Update Status
function updateStatus(publicOrderId, qrcode=false) {

    // Send websocket (update-status) || Update DB
    socket.emit('update-status', {publicOrderId, qrcode, csrf: $('#csrf-token').val()})

}


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

//Helpers 
function substringTo5(text){
    return text.substring(0, 5)
}

function formatDate(date, formatType){
    return moment(date).format(formatType);
}

function getNextStatus(status){
    let updatedStatus = "";
    switch (status) {
        case 'Order Pending':
            updatedStatus = "Preparing Order"
            break;
    
        case 'Preparing Order':
            updatedStatus = "Ready for Collection"
            break;

        case 'Ready for Collection':
            updatedStatus = "Collection Confirmed"
            break;

        default:
            break;
    }

    return updatedStatus;
}

function calcOrderTotal(order){
    let sum = 0;

    for (const orders in order.menuItems) {
        if (order.menuItems.hasOwnProperty(orders)) {
            const orderDetail = order.menuItems[orders];
            
            sum += orderDetail.price*orderDetail.orderItem.quantity

        }
    }

    return sum.toFixed(2);
}