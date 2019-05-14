module.exports = {
    model: (function () {
        return function (Sequelize, db) {
            
            const Order = db.define('order', {
                status: { type: Sequelize.ENUM('Order Pending', 'Preparing Order', 'Ready for Collection', 'Collection Confirmed'), allowNulls: false, unique: false },
                rating: { type: Sequelize.ENUM('0', '1', '2', '3', '4', '5'), allowNulls: false, unique: false },
                orderTiming: { type: Sequelize.DATE, allowNulls: false, unique: false },
            })
            return Order;
        }
    })()
}