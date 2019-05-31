const express = require('express')
//Create router
const router = express.Router()

//Global
const globalHandle = require('../../libs/global/global')

//Setup uuid for csrf authentication
const uuid_middleware = require('../../libs/uuid_middleware')

//Login authentication middleware
const auth_login = require('../../libs/auth_login')

//Get Models
const MenuItem = globalHandle.get('menuItem')
const User = globalHandle.get('user')

//Get App
const app = globalHandle.get('app')



//Define main 'customer' paths

//Payment PAYPAL
const paypal = require('paypal-rest-sdk')
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AQGtzP7jJg8NtDT0gOANp39ANghQOGEfPGlMBhVIAonS3nURnSUgHPmeBi7anGsaVqhryjr_kwERQQAU',
    'client_secret': 'EHpL42iL_PWSPtCJ4LG2sJsQaLdRmXtWvp_NkmrbftbRd3MnpJR2YyLYq6AQMnaFAPuMers0fayrA8h7'
  });
/**
 * GET '/payment' 
 * Payment stage for ordering items
 */
router.get('/payment', auth_login.auth, (req, res) => {

    var create_payment_json = {
        "intent": "order",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/payment-redirect",
            "cancel_url": "http://localhost:3000/payment-void"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "payee": {"email": "payee@gmail.com"},
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
        }
    });

    res.render('payment', {size: MenuItem.count()})
})


module.exports = router