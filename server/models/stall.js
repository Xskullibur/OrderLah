module.exports = {
    model: (function(){
        return function(Sequelize, db){
            
            const Stall = db.define('stall',{
                stallName: { type: Sequelize.STRING(50), allowNulls: false, unique: true },
                description: { type: Sequelize.STRING(255), allowNulls: false, unique: false },
            })

            return Stall;
        }
    })()
}