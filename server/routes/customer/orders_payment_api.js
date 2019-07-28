
const globalHandle = require('../../libs/global/global')

var redis = require('redis')
const client = globalHandle.get('redis-client')

//Database models
const MenuItem = globalHandle.get('menuItem')
const Payment = globalHandle.get('payments')

//database utils
const menu_item_util = require('../../utils/main/menu_item')
const order_utils = require('../../utils/stallowner/order')

const express = require('express')
//Create router
const router = express.Router()

const paypal = require('@paypal/checkout-server-sdk')

let apiKeys = undefined
let environment = undefined


/**
 * SANDBOX keys
 */
apiKeys = {
    'client_id': 'AQGtzP7jJg8NtDT0gOANp39ANghQOGEfPGlMBhVIAonS3nURnSUgHPmeBi7anGsaVqhryjr_kwERQQAU', //i changed it to mine to test -hsienxiang
    'client_secret': 'EHpL42iL_PWSPtCJ4LG2sJsQaLdRmXtWvp_NkmrbftbRd3MnpJR2YyLYq6AQMnaFAPuMers0fayrA8h7'
}
environment = new paypal.core.SandboxEnvironment(apiKeys.client_id, apiKeys.client_secret)


//Setup paypal
const paypalClient = new paypal.core.PayPalHttpClient(environment)

//hsien xiang's route - done by hsien xiang and ziheng

/**
 * GET '/payment' 
 * Payment stage for ordering items
 */
router.get('/payment', async (req, res) => {
    let totalAmount = await getTotalAmount(req)
    res.render('payment', {size: MenuItem.count(), totalAmount: totalAmount, client_id: apiKeys.client_id
    })
})

/**
 * POST '/payment/create'
 * Create a new paypal order
 */
router.post('/payment/create', async (req, res) => {
    let totalAmount = await getTotalAmount(req)
    //Create order on server
    let createRequest = new paypal.orders.OrdersCreateRequest()

    createRequest.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'SGD',
                value: totalAmount                                          
            }
        }]
    })

    //Call create order api
    let paypalRes = await paypalClient.execute(createRequest)

    console.log(`Response: ${JSON.stringify(paypalRes)}`);
    
    console.log(`Order: ${JSON.stringify(paypalRes.result)}`);

    //Put order id in redis
    client.set("paypal-order:"+paypalRes.id, req.sessionID, redis.print)
    client.expire("paypal-order:"+paypalRes.id, 3600)

    res.type('json')
    res.send({orderID: paypalRes.result.id})
    
})

/**
 * Get total amount of a given req
 * @param {object} req 
 */
async function getTotalAmount(req){
    var totalAmount = 0

    for(var orderline of req.cart.items){ 
        console.log(orderline.itemId)
        await menuItem.findOne({where:{id: orderline.itemId}}).then(setPrice =>{
            totalAmount = totalAmount + parseFloat(setPrice.price)
        })
    }

    //Round to 2 decimal
    totalAmount = Math.round(totalAmount * 100) / 100
    return totalAmount
}

const sendOrderToStallOwner = globalHandle.get('websocket:sendOrderToStallOwner')
router.post('/payment/confirm/:orderID', async (req, res) =>{
    var orderID = req.params.orderID
    console.log('Processing new order')
    console.log('Order ID:' + orderID)

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    let order
    try {
        order = await paypalClient.execute(request);
    } catch (err) {
        console.error(err);
        res.status(500)
        res.send('Internal Error')
        return
    }
    var showStatus = order.result.status
    var payerID = order.result.payer.payer_id
    var userID = req.user.id
    var orderStatus = 'Order Pending'

    if (showStatus == 'COMPLETED') {
        Payment.create({orderID, payerName: order.result.payer.name.given_name, payerID, status: showStatus, userID}).then(function(){           
            console.log('transaction details saved to database')           
        }).catch(err => console.log(err))
        let menuItems = await Promise.all(req.cart.items.map(item => menu_item_util.getMenuItemByID(item.itemId)))
        //inserts quantity to menuItems

        let stallIdsWithMenuItemsGrouped = _.groupBy(menuItems, 'stallId')

        for(let stallId in stallIdsWithMenuItemsGrouped){
            let menuItems = stallIdsWithMenuItemsGrouped[stallId]
            let order = await order_utils.createOrder({status: orderStatus, userId: userID, stallId: stallId})
            
            //Group menu items by ids, if there is multiple menu items with the same id, only one will be added with the quantity set to the group size
            let groupedMenuItemIds = _.groupBy(menuItems, 'id')

            for(let menuItemId in groupedMenuItemIds){
                let quantity = groupedMenuItemIds[menuItemId].length
                let order_details = await order_utils.createOrderItem({orderId: order.id, menuItemId: menuItemId, quantity: quantity})
            }

            Order.findOne({
                where: {
                    id: order.id
                },
                include: [{
                    model: MenuItem
                }]
            }).then((orderDetails) => {
                //Send order to stallowner
                sendOrderToStallOwner(stallId, orderDetails)
            })

        }
        req.cart.clearOrderLine(req)
        console.log('transaction complete')
    }
})

module.exports = router