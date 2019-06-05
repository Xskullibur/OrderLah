//Global
const globalHandle = require('../../libs/global/global')
//models
const Stall = globalHandle.get('stall')

/**
* Stall object
* @typedef {Object} Stall
* @property {string} stallName - name of the stall to be created
* @property {number} cusineId - cusine 
* @property {string} description - description of the stall
* @property {number} userId - user id
*/
module.exports = {

    /**
     * Create a stall inside the database
    `* @param {Stall} - to be created inside database
     * @return {Promise} 
     */
    createStall: function({stallName, cusineId, description, userId}){
        return Stall.create({
            stallName: stallName,
            cusineId: cusineId,
            description: description,
            userId: userId,
        })
    }
}