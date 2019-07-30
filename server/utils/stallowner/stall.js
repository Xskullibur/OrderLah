//Global
const globalHandle = require('../../libs/global/global')
//models
const Stall = globalHandle.get('stall')

//Sequelize
const Sequelize = require('sequelize')

/**
* Stall object
* @typedef {Object} Stall
* @property {string} stallName - name of the stall to be created
* @property {number} cusineId - cusine 
* @property {string} description - description of the stall
* @property {number} userId - user id
*/
module.exports = {

    /**
     * Create a stall inside the database
    `* @param {Stall} - to be created inside database
     * @return {Promise} 
     */
    createStall: function({stallName, cusineId, description, userId}){
        return Stall.create({
            stallName: stallName,
            cusineId: cusineId,
            description: description,
            userId: userId,
        })
    },
    /**
     * Return all the stalls that belong to that cusine
     * @param {number} cusineId - cusine id of all the stall belong to that cusine
     * @return {Promise}
     */
    getStallByCusine(cusineId){
        return Stall.findAll({
            where: {
                cusineId
            }
        })
    },

    /**
     * Get all pending customer id for a particular stall 
     * @param {number} stallId 
     * @return {Promise}
     */
    getAllPendingCustomersIDByStallID(stallId){

        stallId = SqlString.escape(stallId);

        return db.query(`
            SELECT orders.userId
            FROM orders
            WHERE orders.stallId = ${stallId}
            AND orders.status != "Collection Confirmed"
            AND DATE(orders.orderTiming) = current_date()
        `, { type: Sequelize.QueryTypes.SELECT })
    },
    
    /**
     * Get stall id from order id
     * @param {number} stallId
     * @return {Promise}
     */
    getStallIDFromOrderID(orderId){

        orderId = SqlString.escape(orderId);

        return db.query(`
            SELECT orders.stallId
            FROM orders
            WHERE orders.id = ${orderId}
        `, { type: Sequelize.QueryTypes.SELECT })
    },
    
    /**
     * Get the Stall by stall id
     * @param {number} stallId 
     * @return {Promise}
     */
    getStallFromStallID(stallId){
        return Stall.findByPk(stallId)
    }

}