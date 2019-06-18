const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, process.cwd() + '/public/uploads')
    },
    filename: function(req, file, cb){
        cb(null, req.user.id + req.body.itemName.replace(/\s/g, "") + ".jpeg")      
    }
})

module.exports = storage
