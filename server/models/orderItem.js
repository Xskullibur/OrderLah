module.exports = {
    model: (function () {
        return function (Sequelize, db) {
            
            const OrderItem = db.define('orderItem', {
                quantity: { type: Sequelize.INTEGER, allowNulls: false, unique: false },
            })
            return OrderItem;
        }
    })()
}