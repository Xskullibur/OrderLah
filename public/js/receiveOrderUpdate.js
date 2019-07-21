
$(document).ready(function() {
    //generate qrcode
    var orderid = getOrderId();
    console.log(orderid)

    var qrcode = new QRCode(document.getElementById("orderid-qr"), {
        text: orderid,
        width: 128,
        height: 128,
        colorDark : "#0044ff",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });


    //setup notifications
    askPermissionForNotifications();
})

/**
 * Parsed the web url and get the last path which indicate the order id
 */
function getOrderId(){  
    // var url = window.location.href;
    // return url.substr(url.lastIndexOf('/') + 1);

    return document.getElementById('pOrderId').value
}

// Send notification
function notify(msg){
    // Check if browser has notifications
    if (("Notification" in window)) {
        // if already granted
        if (Notification.permission === "granted") {
            // create notification
            var notification = new Notification(msg);
        }
    }
}

// Check and ask for permission
function askPermissionForNotifications(){
    // Check if browser has notifications
    if (("Notification" in window)) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(function (permission) {
                // If the user accepts
                if (permission === "granted") {
                    console.log("Notifications enabled");
                }
            });
        }
    }
}