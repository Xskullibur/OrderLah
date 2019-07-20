module.exports = {
    model: (function () {
        return function (Sequelize, db) {
            
            const Order = db.define('order', {
                status: { type: Sequelize.ENUM('Order Pending', 'Preparing Order', 'Ready for Collection', 'Collection Confirmed'), allowNulls: false, unique: false },
                orderTiming: { type: Sequelize.DATE, allowNulls: false, unique: false },
                publicOrderID: { type: Sequelize.STRING, allowNulls: false, unique: true},
            })
            return Order;
        }
    })()
}