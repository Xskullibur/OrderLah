const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, process.cwd() + '/public/reviewimages')
    },
    filename: function(req, file, cb){
        cb(null, "test" + ".jpeg")
    }
})

module.exports = storage