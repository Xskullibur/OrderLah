//Global
const globalHandle = require('../../libs/global/global')
//models
const ResetPass = globalHandle.get('resetpass')

module.exports = {
    createResetPass: function({token, expiryTiming, userId}){
        return ResetPass.create({
            token: token,
            expiryTiming: expiryTiming,
            userId: userId
        })
    },

}