//Global
const globalHandle = require('../../libs/global/global')
//models
const Order = globalHandle.get('order')

module.exports = {
    
    updateOrderStatus: function({orderID, updatedStatus}) {

        // Update  DB based on updated status
        return Order.update({ 
            status: updatedStatus
        }, 
        { 
            where: { id: orderID } 
        })

    },

    /**
     * Get order's current status
     * @param {number} orderID 
     */
    getCurrentStatus(orderID){

        let promise = new Promise((resolve, reject) => {
            Order.findOne({
                where: {id: orderID},
                attributes: ['status']
            }).then((order) => {
                resolve(order.status)
            }).catch((err) => {
                reject(err)
            });
        })

        return promise
    }

}