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
const User = globalHandle.get('user')
const Order = globalHandle.get('order')
const Payment = globalHandle.get('payments')

//Sequelize
const Sequelize = require('sequelize')
const db = globalHandle.get('db')

//Get App
const app = globalHandle.get('app')

//Paths to get to customer pages, can be accessed by: /<whatever>
router.get('/review', (req, res) => {
    res.render('customer/review',{})
});

router.get('/pastOrders', (req, res) => {
    Order.findAll({
        where: {
            status: {
                [Sequelize.Op.or]: ['Order Pending', 'Preparing Order', 'Ready For Collection',]
            },
            // stallId: req.user.id
        },
        order: Sequelize.col('orderTiming'),
        include: [{
            model: MenuItem
        }]

    }).then((currentOrders) => {
        // res.send(currentOrders);

        const testImg = process.cwd() + '/public/img/no-image'
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
                getNextStatus(status){
                    let updatedStatus = "";
                    switch (status) {
                        case 'Order Pending':
                            updatedStatus = "Preparing Order"
                            break;
                    
                        case 'Preparing Order':
                            updatedStatus = "Ready for Collection"
                            break;

                        case 'Ready for Collection':
                            updatedStatus = "Collection Confirmed"
                            break;

                        default:
                            break;
                    }

                    return updatedStatus;
                }
            },
            currentOrders
        });

    }).catch((err) => console.error(err));

});/*res.render('customer/pastorders',{})
});*/

router.get('/trackOrder', (req, res) => {
    res.render('customer/orderStatus',{})
});

router.post('/checkOrder', (req, res) =>{
    //trying to retrieve the ordernumber via the handbar
    let number = req.body.number;
    console.log(number)

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

router.use(auth_login.auth)

const cusine_util = require('../../utils/stallowner/cusine')
const menu_item_util = require('../../utils/main/menu_item')


/**
 * Default GET '/' path
 */
router.get('/', (req, res) => {
    cusine_util.getAllCusine().then(cusines => {
        res.render('index', {cusines: cusines})
    })
})

/**
 * GET '/profile' path
 * Get Profile page
 */
router.get('/profile', (req, res) => {
    res.render('profile', {birthday: req.user != undefined ? moment(req.user.birthday).format('YYYY-MM-DD') : ''})
})
/**
 * Get '/menuItem' all menu items inside the database as JSON
 */
router.get('/menuItems/', (req, res) => {
    res.type('json')
    menu_item_util.getAllMenuItem().then( menuItems => {
        res.type('json')
        res.send(JSON.stringify(menuItems))
    })

})
/**
 * Get '/menuItem/:cusine' all menu items where cusine is {Asian, Japanese, Western} inside the database as JSON
 */
router.get('/menuItems/:cusine', async (req, res) => {
    let cusine = req.params.cusine
    cusine = await cusine_util.getCusineByCusineType(cusine)
    res.type('json')
    menu_item_util.getMenuItemByCusine(cusine.id).then( menuItems => {
            res.send(JSON.stringify(menuItems))
    })

})

/**
 * GET '/menuItemId/:menuItemId'
 * return the specific menu item as JSON
 */
router.get('/menuItemId/:menuItemId', (req, res) =>{
    menu_item_util.getMenuItemByID(req.params.menuItemId).then((menuItem) => {
        res.type('json')
        res.send(JSON.stringify(menuItem))
    })
})

/**
 * GET '/menuItemSearch/:item_name'
 * return all menu items specified by the item_name
 * params: item_name
 */
router.get('/menuItemSearch/:item_name', (req, res) => {
    menu_item_util.getMenuItemByName(req.params.item_name).then((menuItems) => {
        res.type('json')
        res.send(JSON.stringify(menuItems))
    })
})

const getRatingMatrix = require('../../ratings/ratings')
const SVD_Optimizer = require('../../libs/ml/svd_sgd')

let optimizer;


/**
 * GET '/recommendedMenuItems'
 * Return user perferences menu items
 */
router.get('/recommendedMenuItems', (req, res) => {
    //let userId = req.user.id

    trainIfNotTrained(() => {
        let menuItemsIds = optimizer.getRatingMatrix()[1]
        menuItemsIds = argsort(menuItemsIds).slice(0, 5)
    
        menuItemsIds = menuItemsIds.map(v => menu_item_util.getMenuItemByID(v))
    
        Promise.all(menuItemsIds).then(menuItems => {
            menuItems = menuItems.filter((e) => e != null)
            res.type('json')
            res.send(JSON.stringify(menuItems))
        })
    })

})

/**
 * GET '/cartMenuItems'
 * Returns all current order cart items
 */
router.get('/cartMenuItems', (req, res) => {
    
    res.type('json')
    res.send(JSON.stringify(menuItems))
})

function trainIfNotTrained(cb){
    if(optimizer == undefined || optimizer == null){
        getRatingMatrix(db, MenuItem, User).then((ratings) => {
            optimizer = new SVD_Optimizer(ratings, 20, 0.001, 1000)
            optimizer.reset()
            optimizer.train()
            cb()
        })
    }else{
        getRatingMatrix(db, MenuItem, User).then((ratings) => {
            //Retrain
            optimizer.updateRatingsMatrix(ratings)
            optimizer.iterations = 100
            optimizer.train()
            cb()
        })
        
    }
}


function argsort(arr){
    return arr.map((item, index) => [item, index])
    .sort((a,b) => b[0] - a[0])
    .map(v => v[1])
}

router.get('/getRatingData', async (req, res) =>{

    
    let optimizer = new SVD_Optimizer()
    
    let pMatrix = optimizer.getRatingMatrix()
    console.log(ratings);
    res.send(pMatrix)
})

const orders_api_routes = require('./orders_api')
router.use(orders_api_routes)

//Define main 'customer' paths

const paypal = require('paypal-rest-sdk')
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AazJKzsDqoiA6ApXquTum5zTKDC4QmPlbzZXG8YCwmnoQyzPviV8q-2-JBrXbhh-VXS_Nutq8sp4ybGc', //i changed it to mine to test -hsienxiang
    'client_secret': 'EBQDifpjwCyCCB3LNgKqSexOA3cigW6GJ1Kuf-FiDuOmMZeHEgPyYtzXrK2kKyf7LyxIF72AKJQEeMOL'
  });

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk')
const payPalClient = require('./ppClient')


//hsien xiang's route - done by hsien xiang and ziheng

router.get('/payment', auth_login.auth, async (req, res) => {
    var totalAmount = 0

    for(var orderline of req.cart.items){
        console.log(orderline.itemId)
        await menuItem.findOne({where:{id: orderline.itemId}}).then(setPrice =>{
            //console.log(setPrice.price)
            totalAmount = totalAmount + parseFloat(setPrice.price)
        })
    }

    console.log('total amount: ' + totalAmount)
    res.render('payment', {size: MenuItem.count(), totalAmount: totalAmount})

})

router.post('/confrimPayment', auth_login.auth, async (req, res) =>{
    var payerName = req.body.payerName
    var orderID = req.body.orderID
    console.log(orderID)
    console.log(payerName)

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    let order
    try {
        order = await payPalClient.client().execute(request);
        console.log(order)
    } catch (err) {
        console.error(err);
        return res.send(500);
    }
    var showStatus = order.result.status
    var payerID = order.result.payer.payer_id
    userID = req.user.id
    if (showStatus == 'COMPLETED') {
        Payment.create({orderID, payerName, payerID, status: showStatus, userID}).then(function(){
            console.log('transaction details saved to database')
            req.cart.clearOrderLine()
        }).catch(err => console.log(err))
        console.log('transaction confrimed')
    }

})

module.exports = router