//Global
const globalHandle = require('../../libs/global/global')

//Get models
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
    createOrderItem: function({orderId, menuItemId, rating, comments, quantity = 1}){
        return OrderItem.create({
            quantity: quantity,
            orderId: orderId,
            menuItemId: menuItemId,
            rating,
            comments
        })
    },

    
    /**
     * Get all user orders 
     * @param {number} userId - User id of all the orders
     * @return {Promise}
     */
    getOrderByUserId: function(userId){
        return Order.findAll({
            where: {
                userId
            }
        })
    },

    /**
     * Get order by order id
     * @param {number} orderId - order id
     * @return {Promise}
     */
    getOrderId: function(orderId){
        return Order.findByPk(orderId)
    },

    /**
     * Check if the order id belongs to a user id
     * @param {number} userId - user id
     * @param {number} orderId - order id
     * @return {Promise}
     */
    checkOrderIsInUser: function (userId, orderId) {
        let promise = new Promise((resolve, reject) => {
            Order.count({
                where: {
                    userId, id:orderId
                }
            }).then(count => {
                resolve(count == 1)
            })

        })
        return promise
    }

}