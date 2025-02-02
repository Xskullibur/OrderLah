module.exports = {
    model: (function () {
        return function (Sequelize, db) {

            const MenuItem = db.define('menuItem', {
                image: { type: Sequelize.STRING, allowNulls: true, unique: false },
                itemName: { type: Sequelize.STRING(50), allowNulls: false, unique: false },
                itemDesc: { type: Sequelize.STRING(255), allowNulls: false, unique: false },
                price: { type: Sequelize.DECIMAL(10, 2), allowNulls: false, unique: false },
                active: { type: Sequelize.BOOLEAN, allowNulls: true, unique: false},
                owner: { type: Sequelize.STRING, allowNulls: true, unique: false },
            })

            return MenuItem;
        }
    })()
}