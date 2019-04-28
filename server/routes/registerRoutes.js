const express = require('express')
//Create router
const router = express.Router()

var nodemailer = require('nodemailer');

var sender = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'acelearninghx@gmail.com',
      pass: 'feifi@85@#*#vjslrfieefe'
    }
  });

router.get('/register', (req, res) => {
    res.render('register', {layout: 'blank_layout'})
})

router.post('/registerData', (req, res) => {
    let emailAddress = req.body.email

    var verificationEMAIL = {
        from: 'acelearninghx@gmail.com',
        to: emailAddress,
        subject: 'OrderLah registration',
        text: 'test'
      };

      sender.sendMail(verificationEMAIL)
       
});


module.exports = router