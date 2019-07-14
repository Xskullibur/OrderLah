module.exports = {
    model: (function () {
        return function (Sequelize, db) {
            
            const OrderItem = db.define('orderItem', {
                quantity: { type: Sequelize.INTEGER, allowNulls: false, unique: false },
                rating: { type: Sequelize.ENUM('0', '1', '2', '3', '4', '5'), allowNulls: true, unique: false },
                comments: { type: Sequelize.STRING(255), allowNulls: true, unique: false },
                image: { type: Sequelize.STRING, allowNulls: true, unique: false },
            })
            return OrderItem;
        }
    })()
}