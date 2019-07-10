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

    }

}