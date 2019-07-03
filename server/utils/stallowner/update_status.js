//Global
const globalHandle = require('../../libs/global/global')
//models
const Order = globalHandle.get('order')

module.exports = {
    
    updateOrderStatus: function(orderID, currentStatus) {

        // Get order that status is going to be updated
        let selectedOrder = new Promise(function(resolve, reject) {
            let status = getUpdateStatus(currentStatus)
            Order.update({ status }, { where: { id: orderID } })
        })

        return selectedOrder
    }

}

const STATUS = {
    OrderPending: 'Order Pending',
    PreparingOrder: 'Preparing Order',
    ReadyForCollection: 'Ready for Collection',
    CollectionConfirmed: 'Collection Confirmed'
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