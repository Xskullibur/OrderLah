module.exports = {
    model: (function () {
        return function (Sequelize, db) {

            const Cusine = db.define('cusine', {
                cusineType: { type: Sequelize.STRING(50), allowNulls: false, unique: true },
            })

            return Cusine;
        }
    })()
}