
/**
 * Order Cart API
 * 
 * To add order
 * POST /order/addOrder
 * params: menuItemId
 * 
 * To list cart items 
 * GET /cartItems
 * 
 * To delete a order 
 * 
 */

const express = require('express')
//Create router
const router = express.Router()

const uuid_middleware = require('../../libs/uuid_middleware')

const menu_item_util = require('../../utils/main/menu_item')


const order_track = require('../../libs/order_track')
//create cart, res.locals.cart_items, req.cart
router.use(order_track.register)

const order_util = require('../../utils/stallowner/order')
router.get('/orderStatus/:pubOrderId', uuid_middleware.generate, async (req, res) => {

    //Check user is authorised to access order id 
    const pubOrderId = req.params.pubOrderId
    const userId = req.user.id

    order_util.getOrderFromPublicOrderID(pubOrderId).then(async (order) => {

        const orderId = order.id

        let valid = await order_util.checkOrderIsInUser(userId, orderId)
    
        if(valid){

            if(order.status != 'Collection Confirmed'){
                res.render('customer/order-status', {order})
            }else{
                res.redirect('/pastOrders')
            }
        }else res.redirect('/orderStatus')
    })
})

/**
 * GET '/addOrder'
 * add new order to user cart
 * params: menuItemId - menu item id to be added to cart
 */
router.post('/addOrder', (req, res) => {
    //Add order
    if(req.cart != null){

        const orderline = new order_track.orderline(req.body.menuItemId)

        menu_item_util.getMenuItemByID(req.body.menuItemId).then((menuItem) => {
            if(menuItem != null){
                req.cart.addOrderLine(orderline)
                res.type('json')
                res.send(JSON.stringify(orderline))
            }
        })


    }
})

/**
 * GET '/cartItems'
 * returns all the current cart items for the user
 */
router.get('/cartItems', (req, res) => {
        res.type('json')
        res.send(JSON.stringify(req.cart.items))
})

/**
 * GET '/cartItemsCount'
 * returns the size of the cart items
 */
router.get('/cartItemsCount', (req, res) => {
    res.send(JSON.stringify(req.cart.items.length))
})

/**
 * DELETE '/removeOrder'
 * remove existing order from the cart
 * params: orderLineId
 */
router.delete('/removeOrder', (req, res) => {
    req.cart.removeOrderLine(req.body.orderLineId)
    res.send('Success')

})

module.exports = router