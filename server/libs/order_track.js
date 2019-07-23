/**
 * This js library tracks user orders through session
 */

/**
 * users_carts store each individual order carts
 * 
 * To access a specific user cart, do users_carts.<userId>
 * @returns {Cart} - a cart object
 */
// let users_carts = {}

/**
 * Cart
 * @typedef {Object} cart
 * @property {number} belongsToUserId - the cart belongs to which user
 * @property {number} items - list of orderlines
 * @private @property {number} _orderLineCounter - used for setting orderlines id
 */

 /**
 * OrderLine
 * @typedef {Object} orderline
 * @property {number} orderlineId - id of the orderline
 * @property {number} itemId - orderline menu item id
 * @property {number} quantity - quantity of the specific item (default 1)
 */

/**
 * User cart object
 * @param {number} userId 
 */
function cart(userId){
    this.belongsToUserId = userId
    this.items = []
    this._orderLineCounter = 0
}

/**
 * Add a new order item to the user cart
 * @param {orderline} orderLine - OrderLine object to be added to the user cart 
 */
cart.prototype.addOrderLine = function(orderLine){
    this.items.push(orderLine)
    orderLine.orderLineId = this._orderLineCounter
    this._orderLineCounter++
}

cart.prototype.removeOrderLine = function(orderLineId){
    let index = this.items.findIndex(v => v.orderLineId == orderLineId)
    if(index != -1){
        //Remove the orderline
        this.items.splice(index, 1)
    }
}


function orderline(itemId, quantity = 1){
    this.itemId = itemId
    this.quantity = quantity
}

// const menuitem_utils = require('../utils/main/menu_item')


module.exports = {
    
    register(req, res, next){
        let tmp_cart = req.session._cart
        if(tmp_cart != null){

            tmp_cart.__proto__ = cart.prototype

            req.cart = tmp_cart
        }else{
            //Create new cart
            req.session._cart = new cart(req.user.id)
            tmp_cart = req.session._cart
            req.cart = tmp_cart
        }
        next()

        // //Register to handlebars locals
        // if(req.cart.items.length != 0){
        //     let menuItemsPromises = req.cart.items.map(v => menuitem_utils.getMenuItemByID(v.itemId))
        //     Promise.all(menuItemsPromises).then(menuItems => {
        //         res.locals.cart_items = menuItems
        //         next()
        //     })
        // }else{
        //     next()
        // }

        
    },

    orderline

}
