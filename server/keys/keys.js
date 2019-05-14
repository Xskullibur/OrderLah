const fs = require('fs')

module.exports = {
    publicKey: fs.readFileSync('.public.key', 'utf8'),
    privateKey: fs.readFileSync('.private.key', 'utf8'),

    signingOptions: {
        issuer: 'OrderLah',
        expiresIn:  "1h",
        algorithm:  "RS256"
    }

}
