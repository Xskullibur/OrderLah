//Global
const globalHandle = require('../../libs/global/global')

//Get models
const RememberMe = globalHandle.get('rememberme')

const uid = require('uid2')

function consumeToken(token, fn) {
    RememberMe.findOne({
        where: {token}
    }).then((rememberMe) => {
        if(rememberMe){
            //Change the token to expired after single-use
            rememberMe.update({expired: true})

            fn(null, rememberMe)
        }
    })
}
  
function saveToken(token, uid, fn) {
    RememberMe.create({
        token, userId: uid
    })
    return fn();
}

function generateToken(length) {
    return uid(length)
}

module.exports = {
    consumeToken, saveToken, generateToken
}
  