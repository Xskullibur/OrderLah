//Global
const globalHandle = require('../../libs/global/global')
//models
const Cusine = globalHandle.get('cusine')

module.exports = {
    /**
     * Create a cusine inside database
     * @param {string} cusineType - cusine type such as Western, Asian etc..
     * @return {Promise} 
     */
    createCusine: function (cusineType) {
        return Cusine.create({
            cusineType: cusineType
        })
    },
    /**
     * Returns all cusine from database
     * @return {Promise}
     */
    getAllCusine: function() {
        return Cusine.findAll()
    },
    /**
     * Find cusine by cusine name or cusine type
     * @param {string} cusineType 
     * @return {Promise}
     */
    getCusineByCusineType: function(cusineType){
        return Cusine.findOne({where: {cusineType}})
    }
}

