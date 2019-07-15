const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, process.cwd() + '/public/uploads')
    },
    filename: function(req, file, cb){
        cb(null, req.user.id + ".jpeg")      
    }
})

module.exports = storage