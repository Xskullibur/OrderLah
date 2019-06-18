const express = require('express')
//Create router
const router = express.Router()
//MomentJS
const moment = require('moment')

//Global
const globalHandle = require('../../libs/global/global')


//Setup uuid for csrf authentication
const uuid_middleware = require('../../libs/uuid_middleware')

//Login authentication middleware
const auth_login = require('../../libs/auth_login')

//Get Models
const MenuItem = globalHandle.get('menuItem')
const OrderItem = globalHandle.get('orderItem')
const User = globalHandle.get('user')
const Order = globalHandle.get('order')

//Sequelize
const Sequelize = require('sequelize')

//Get App
const app = globalHandle.get('app')

//validation

//Define main 'customer' paths

//Payment PAYPAL
const paypal = require('paypal-rest-sdk')
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AQGtzP7jJg8NtDT0gOANp39ANghQOGEfPGlMBhVIAonS3nURnSUgHPmeBi7anGsaVqhryjr_kwERQQAU',
    'client_secret': 'EHpL42iL_PWSPtCJ4LG2sJsQaLdRmXtWvp_NkmrbftbRd3MnpJR2YyLYq6AQMnaFAPuMers0fayrA8h7'
  });

router.use(auth_login.auth)

/**
 * GET '/payment' 
 * Payment stage for ordering items
 */
router.get('/payment', (req, res) => {

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




//Paths to get to customer pages, can be accessed by: /<whatever>

router.get('/review/:id/:orderid', (req, res)=> {
    OrderItem.findOne({
        where: {
            menuItemId: req.params.id,
            orderId: req.params.orderid
        }
    })
    .then((orderItem) => {
        res.render('customer/review', {
            orderItem
        });
    })
});

router.post('/saveReview/:id/:orderid', (req, res) => {
    let comments = req.body.comments;

    OrderItem.update({
        comments
    }, {
        where: {
            menuItemId: req.params.id,
            orderId: req.params.orderid
        }
    }).then(() => {
        res.redirect('/pastOrders');
    }).catch((err) => console.error(err));
});
//Current Orders
router.get('/pastOrders', (req, res, next) => {
    
    //Get Stall ID
    

    /**
    * Get Current Orders
    * Based on Stall ID received by function
    * WHERE Status != Collection Completed
    */
    Order.findAll({
        where: {
            userId: req.user.id,
        },
        order: Sequelize.col('orderTiming'),
        include: [{
            model: MenuItem
        }]

    }).then((currentOrders) => {

        res.render('customer/pastorders', {
            
            helpers: {
                calcTotal(order){
                    let sum = 0;
                    order.menuItems.forEach(order => {
                        sum += order.price*order.orderItem.quantity
                    });
                    return sum.toFixed(2);
                },
                calcItemPrice(items){
                    return (items.price * items.orderItem.quantity).toFixed(2)
                },
                formatDate(date, formatType){
                    return moment(date).format(formatType);
                },
                getTitle(menuItem){
                    let title = []

                    menuItem.forEach(item => {
                        title.push(`${item.itemName} x${item.orderItem.quantity}`)
                    });

                    return title.join(', ')
                },
                
            },
            currentOrders
        });

    }).catch((err) => console.error(err));

});

/*router.get('/pastOrders', (req, res) => {
    Order.findAll({
        attributes: [ 'id' ],
            where: {
                userId: userID
            },
        order: Sequelize.col('orderTiming'),
        include: [{
            model: MenuItem
        }]

    }).then((currentOrders) => {
        // res.send(currentOrders);

        const testImg = process.cwd() + '/public/img/no-image'
        res.render('customer/pastorders', {
            currentOrders:currentOrders,
            helpers: {
                calcTotal(order){
                    let sum = 0;
                    order.menuItems.forEach(order => {
                        sum += order.price*order.orderItem.quantity
                    });
                    return sum.toFixed(2);
                },
                calcItemPrice(items){
                    return (items.price * items.orderItem.quantity).toFixed(2)
                },
                formatDate(date, formatType){
                    return moment(date).format(formatType);
                },
                getTitle(menuItem){
                    let title = []

                    menuItem.forEach(item => {
                        title.push(`${item.itemName} x${item.orderItem.quantity}`)
                    });

                    return title.join(', ')
                },
                
            },
            currentOrders
        });

    }).catch((err) => console.error(err));

});
*/

router.get('/trackOrder', (req, res) => {
    res.render('customer/orderStatus',{})
});

router.post('/checkOrder', (req, res) =>{
    //trying to retrieve the ordernumber via the handbar
    let number = req.body.number;
    //console.log(number)
    
    Order.findOne({
        where:{
            id: number //matches the order number input with the id in "order" table (just to test)
        }
    }).then((order) => {
        res.render('customer/orderStatus', {
            order
        });
    })
    console.log(number)
})

module.exports = router