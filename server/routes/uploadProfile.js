const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, process.cwd() + '/public/img/profiles')
    },
    filename: function(req, file, cb){
        cb(null, req.user.id + ".png")      
    }
})

module.exports = storage