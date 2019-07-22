module.exports = {
    model: (function(){
        return function(Sequelize, db){
            
            const ResetPass = db.define('resetpass',{
                token: { type: Sequelize.STRING(50), allowNulls: false, unique: true },
                tokenTiming: { type: Sequelize.DATE, allowNulls: false, unique: false },
            })

            return ResetPass;
        }
    })()
}