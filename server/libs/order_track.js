/**
 * This js library tracks user orders through session
 */

/**
 * users_carts store each individual order carts
 * 
 * To access a specific user cart, do users_carts.<userId>
 * @returns {Cart} - a cart object
 */
let users_carts = {}

/**
 * Cart
 * @typedef {Object} cart
 * @property {number} belongsToUserId - the cart belongs to which user
 * @property {number} items - list of orderlines
 */

 /**
 * OrderLine
 * @typedef {Object} orderline
 * @property {number} items - list of orderlines
 * @property {number} quantity - quantity of the specific item (default 1)
 */

/**
 * User cart object
 * @param {number} userId 
 */
function cart(userId){
    this.belongsToUserId = userId
    this.items = []

}

/**
 * Add a new order item to the user cart
 * @param {orderline} orderLine - OrderLine object to be added to the user cart 
 */
cart.prototype.addOrderLine = function(orderLine){
    this.items.push(orderLine)
}

cart.prototype.removeOrderLine = function(orderLine){
    //NOT IMPLEMENTED
}


function orderline(itemId, quantity = 1){
    this.itemId = itemId
    this.quantity = quantity
}


module.exports = {
    
    register(req, res, next){
        let tmp_cart = users_carts[req.user.id]
        if(tmp_cart != null){
            req.cart = tmp_cart
        }else{
            //Create new cart
            users_carts[req.user.id] = new cart(req.user.id)
            req.cart = tmp_cart
        }
        
        next()
    },

    orderline

}
