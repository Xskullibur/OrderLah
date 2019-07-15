module.exports = {
    model: (function(){
        return function(Sequelize, db){
            
            const Payments = db.define('payments',{
                orderID: { type: Sequelize.STRING(50), allowNulls: false, unique: true },
                payerName: { type: Sequelize.STRING(50), allowNulls: false, unique: false },
                payerID: { type: Sequelize.STRING(50), allowNulls: false, unique: false },
                status: { type: Sequelize.STRING(50), allowNulls: false, unique: false },
            })

            return Payments;
        }
    })()
}