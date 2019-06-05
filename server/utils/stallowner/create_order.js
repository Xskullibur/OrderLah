//Global
const globalHandle = require('../../libs/global/global')

//Get models
const MenuItem = globalHandle.get('menuItem')
const OrderItem = globalHandle.get('orderItem')
const Order = globalHandle.get('order')

/**
 * Order
 * @typedef {Object} Order
 * @property {string} status - 'Order Pending', 'Preparing Order', 'Ready for Collection', 'Collection Confirmed'
 * @property {int} userId - user whom paid for the order as id
 * @property {int} stallId - stall whom will prepare the order as id
 * @property {Date=} orderTiming - date of the transaction (default current date)
 */
/**
 * OrderItem
 * @typedef {Object} OrderItem
 * @property {number} orderId 
 * @property {number} menuItemId 
 * @property {number} quantity - quantity of the specific item (default 1)
 */
/**
 * MenuItem
 * @typedef {Object} MenuItem
 * @param {string} itemName - name of the menu item
 * @param {string} itemDesc - menu item description
 * @param {number} price - price of the menu item
 * @param {number} stallId - stall which owns or created the menu item
 * @param {boolean} active - wheather the menu item can be still ordered (default true)
 */

module.exports = {

    /**
     * Create a new order record inside database
     * @param {Order} order - to be created inside database
     * @return {Promise} 
     */
    createOrder: function({status, userId, stallId, orderTiming = new Date}){
        return Order.create({
            status: status,
            orderTiming: orderTiming,
            userId: userId,
            stallId: stallId
        })
    },

    /**
     * Create a new order item for a specific order inside database, one order can have many order items
     * @param {OrderItem} orderitem - to be created inside database
     * @return {Promise} 
     */
    createOrderItem: function({orderId, menuItemId, quantity = 1}){
        return OrderItem.create({
            quantity: quantity,
            orderId: orderId,
            menuItemId: menuItemId
        })
    },

    /**
     * Create a new menu item for a stall inside database
     * @param {MenuItem} menuItem - to be created inside database
     * @return {Promise} 
     */
    createMenuItem: function({itemName, itemDesc, price, stallId, active = true}){
        return MenuItem.create({
            itemName: itemName,
            itemDesc: itemDesc,
            price: price,
            active: active,
            stallId: stallId
        })
    },

}