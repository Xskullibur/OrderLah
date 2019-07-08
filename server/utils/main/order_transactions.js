//Global
const globalHandle = require('../../libs/global/global')
//models
const Order = globalHandle.get('order')
const User = globalHandle.get('user')

module.exports = {

    getCustomerByOrderID: function(orderId) {

        return Order.findOne({
            where: {
                id: orderId
            },
            include: {
                model: User
            }
        })

    }

}