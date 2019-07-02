//Global
const globalHandle = require('../../libs/global/global')
//models
const Order = globalHandle.get('order')

module.exports = {
    
    updateOrderStatus: function(orderID, currentStatus) {

        // Get order that status is going to be updated
        let selectedOrder = new Promise(function(resolve, reject) {
            Order.findOne({
                where: {
                    id: orderID
                }
            }).then(result => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })
        })

        let status = getUpdateStatus(currentStatus)

        return Order.update({ status }, { where: { id: orderID } })
    }

}

function getUpdateStatus(status) {
    switch (status) {
        case STATUS.OrderPending:
            return STATUS.PreparingOrder

        case STATUS.PreparingOrder:
            return STATUS.ReadyForCollection

        case STATUS.ReadyForCollection:
            return STATUS.CollectionConfirmed

    }
}