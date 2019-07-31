//Global
const globalHandle = require('../../libs/global/global')

const user_util = require('../../utils/main/user')

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
            .then(() => {
                user_util.getUserByID(rememberMe.userId).then(user => {
                    fn(null, user)

                })

            })

        }
    })
}
  
function saveToken(token, uid, fn) {
    RememberMe.create({
        token, userId: uid
    }).then(() => {
        fn()
    })
}

function generateToken(length) {
    return uid(length)
}

module.exports = {
    consumeToken, saveToken, generateToken
}
  