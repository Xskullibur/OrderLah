const multer = require('multer');
const path = require('path');

const uuidv4 = require('uuid/v4');

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, process.cwd() + '/public/reviewimages')
        //cb(null, './public/reviewimages')
    },
    filename: function(req, file, cb){
        cb(null, uuidv4() + ".jpeg")
    }
})

module.exports = storage