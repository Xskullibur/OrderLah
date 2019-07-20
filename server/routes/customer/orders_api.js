
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

const menu_item_util = require('../../utils/main/menu_item')


const order_track = require('../../libs/order_track')
//create cart, res.locals.cart_items, req.cart
router.use(order_track.register)

const order = require('../../utils/stallowner/order')
router.get('/orderStatus/:orderId', async (req, res) => {

    //Check user is authorised to access order id 
    const orderId = req.params.orderId
    const userId = req.user.id

    let valid = await order.checkOrderIsInUser(userId, orderId)
    
    if(valid){
        order.getOrderId(orderId).then((order => {
            res.render('order-status', {order, helpers: {
                substringTo5(text){
                    return text.substring(0, 5)
                }
            }})
        }))
    }else res.redirect('/orderStatus')



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

        req.cart.addOrderLine(orderline)
        res.type('json')
        res.send(JSON.stringify(orderline))
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
 * DELETE '/removeOrder'
 * remove existing order from the cart
 * params: orderLineId
 */
router.delete('/removeOrder', (req, res) => {
    req.cart.removeOrderLine(req.body.orderLineId)
    res.send('Success')

})

module.exports = router