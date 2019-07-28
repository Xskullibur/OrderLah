//Global
const globalHandle = require('../../libs/global/global')

//Get models
const OrderItem = globalHandle.get('orderItem')
const Order = globalHandle.get('order')
const User = globalHandle.get('user')
const Stall = globalHandle.get('stall')
const MenuItem = globalHandle.get('menuItem')


//MomentJS
const moment = require('moment')

//Secure Random 
const uuidv4 = require('uuid/v4')


//Sequelize
const Sequelize = require('sequelize')
/**
 * Order
 * @typedef {Object} Order
 * @property {string} status - 'Order Pending', 'Preparing Order', 'Ready for Collection', 'Collection Confirmed'
 * @property {int} userId - user whom paid for the order as id
 * @property {int} stallId - stall whom will prepare the order as id
 * @property {Date} orderTiming - date of the transaction (default current date)
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
    createOrder: function({status, userId, stallId, orderTiming = moment().local().format('YYYY-MM-DD HH:mm:ss')}){
        const buffer = Buffer.allocUnsafe(16);
        uuidv4(null, buffer, 0)

        const publicOrderID = buffer.toString('hex').toUpperCase()

        return Order.create({
            status: status,
            orderTiming: orderTiming,
            userId: userId,
            stallId: stallId,
            publicOrderID
        })
    },

    /**
     * Create a new order item for a specific order inside database, one order can have many order items
     * @param {OrderItem} orderitem - to be created inside database
     * @return {Promise} 
     */
    createOrderItem: function({orderId, menuItemId, rating = null, comments = null, quantity = 1}){
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
     * Get all user orders (includes MenuItem) 
     * @param {number} userId - User id of all the orders
     * @return {Promise}
     */
    getOrdersWithMenuItemsByUserId: function(userId){
        return Order.findAll({
            where: {
                userId
            },
            order: Sequelize.col('orderTiming'),
            include: [{
                model: MenuItem
            }]
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
    },

    /**
     * Get all menu items belonging to a stall owner id
     * @param {Number} stallId 
     */
    getStallOwnerMenuItems: function (stallId) {
        return db.query(`SELECT menuItems.id, menuItems.itemName
        FROM menuItems
        WHERE menuItems.stallId = ${stallId};`)
    },

    /**
     * Get Stall + StallOwner info from logged in user id
     * @param {number} userID 
     */
    getStallInfo: function (userID) {
        let promise = new Promise((resolve, reject)=>{

            User.findOne({
                where: {
                    id: userID
                },
                include: [{
                    model: Stall
                }]
            }).then(stall => {
                resolve(stall)
            }).catch((err) => {
                console.log(`ERROR: ${err}`)
            })
        })
        return promise
    },

    /**
     * Get all ratings based on menu item id
     * @param {number} menuItemId 
     */
    getMenuItemRatings: function (menuItemId, item_filter = null, rating_filter = null) {

        let query = `SELECT IFNULL(CONCAT(users.firstName, " ", users.lastName), users.firstName) AS CUSTOMER_NAME, orderItems.rating, orderItems.comments, orderItems.image
        FROM orders
        INNER JOIN orderItems ON orderItems.orderId = orders.id
        INNER JOIN menuItems ON orderItems.menuItemId = menuItems.id
        INNER JOIN users ON orders.userId = users.id
        WHERE orders.status = 'Collection Confirmed'
        AND menuItems.id = ${menuItemId}
        `

        if (item_filter) {
            query += ` AND menuItems.id = ${item_filter}`
        }

        if (rating_filter){
            query += ` AND orderItems.rating = "${rating_filter}"`
        }

        query += ' ORDER BY 2 DESC'

        return db.query(query)
    },

    /**
     * Get average rating for a given menu item id
     * @param {number} menuItemId 
     * @return {Promise}
     */
    getMenuItemRating: function(menuItemId){
        return db.query(`
        SELECT CEIL(AVG(orderItems.rating) - 1) AVG
        FROM orders
        INNER JOIN orderItems ON orderItems.orderId = orders.id
        WHERE orders.status = 'Collection Confirmed' 
        AND orderItems.menuItemId = ${menuItemId}
        
        `, { type: Sequelize.QueryTypes.SELECT })
    },

    /**
     * Get the number of orders before given order
     * @param {number} orderId 
     * @return {Promise}
     */
    getNumberOfOrdersBeforeOrder: function(orderId){
        return db.query(`SELECT COUNT(*) AS "ordersCount"
        FROM orders, (
            SELECT id, stallId, orderTiming
            FROM orders
            WHERE orders.id = ${orderId}
        ) as a
        WHERE orders.stallId = a.stallId
        AND orders.status != 'Collection Confirmed'
        AND orders.id <= a.id
        AND DATE(orders.orderTiming) = current_date()
        AND a.orderTiming >= orders.orderTiming;`, { type: Sequelize.QueryTypes.SELECT })
    },

    getOrderIDFromUserId(userId){
        return db.query(`
            SELECT orders.id
            FROM orders
            WHERE orders.userId = ${userId}
            AND orders.status != "Collection Confirmed"
            LIMIT 1
        `, { type: Sequelize.QueryTypes.SELECT })
    },

    /**
     * Get Order Id from Public Order Id
     * @param {number} pOrderId 
     */
    getOrderIdFromPublicId(pOrderId){
        let promise = new Promise((resolve, reject) => {
            Order.findOne({
                where: { publicOrderID: pOrderId },
                attributes: ['id']
            }).then(order => {
                resolve(order.id)
            }).catch(err => {
                reject(err)
            })
        })

        return promise
    },
    
    /** 
     * Returns the order using the public order id
     * @param {number} publicOrderID - public order id of the order
     * @return {Promise}
     */
    getOrderFromPublicOrderID(publicOrderID){
        return Order.findOne({
            where: {
                publicOrderID
            }
        })
    }

}