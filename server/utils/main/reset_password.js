//Global
const globalHandle = require('../../libs/global/global')
//models
const ResetPass = globalHandle.get('resetpass')

module.exports = {
    createResetPass: function({token, tokenTiming, userId}){
        return ResetPass.create({
            token: token,
            tokenTiming: tokenTiming, 
            userId: userId
        })
    },

}