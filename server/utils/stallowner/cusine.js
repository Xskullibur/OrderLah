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
    }
}

