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

//Sequelize
const Sequelize = require('sequelize')

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
        currentOrders = currentOrders.filter(order => order.userId == req.user.id)
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
router.get('/menuItems', (req, res) => {
    menu_item_util.getAllMenuItem().then( menuItems => {
        //Need get ratings for all menuItems (Not that efficient due to the fact it has to grab rating for each menu item)
        includeMenuItemsWithRating(menuItems, () => {
            res.type('json')
            res.send(formatMenuItemsToIndexHandlebars(menuItems))
        })
    })

})
/**
 * Get '/menuItem/:cusine' all menu items where cusine is {Asian, Japanese, Western} inside the database as JSON
 */
router.get('/menuItems/:cusine', async (req, res) => {
    let cusine = req.params.cusine
    cusine = await cusine_util.getCusineByCusineType(cusine)
    menu_item_util.getMenuItemByCusine(cusine.id).then( menuItems => {
        //Need get ratings for all menuItems (Not that efficient due to the fact it has to grab rating for each menu item)
        includeMenuItemsWithRating(menuItems, () => {
            res.type('json')
            res.send(formatMenuItemsToIndexHandlebars(menuItems))
        })
    })

})

/**
 * GET '/menuItemId/:menuItemId'
 * return the specific menu item as JSON
 */
router.get('/menuItemId/:menuItemId', (req, res) =>{
    menu_item_util.getMenuItemByID(req.params.menuItemId).then((menuItem) => {
        //Need get ratings for all menuItems (Not that efficient due to the fact it has to grab rating for each menu item)
        includeMenuItemWithRating(menuItem, () => {
            res.type('json')
            res.send(formatMenuItemToIndexHandlebars(menuItem))
        })
    })
})

/**
 * GET '/menuItemSearch/:item_name'
 * return all menu items specified by the item_name
 * params: item_name
 */
router.get('/menuItemSearch/:item_name', (req, res) => {
    menu_item_util.getMenuItemByName(req.params.item_name).then((menuItems) => {
        //Need get ratings for all menuItems (Not that efficient due to the fact it has to grab rating for each menu item)
        includeMenuItemsWithRating(menuItems, () => {
            res.type('json')
            res.send(formatMenuItemsToIndexHandlebars(menuItems))
        })

    })
})

const order_util = require('../../utils/stallowner/order')
/**
 * Add a new ratings field into each menu item
 * @param menuItems - array of menu items
 */
function includeMenuItemsWithRating(menuItems, done){
    let promises = menuItems.map(menuItem => order_util.getMenuItemRating(menuItem.id))

    Promise.all(promises).then(ratings => {
        menuItems.forEach((menuItem, index) => {
            menuItem.rating = ratings[index][0]['AVG']
        })
        done()
    })
}

/**
 * Add a new ratings field into the menu item
 * @param menuItem - the menu item of the object to have a new field added
 */
function includeMenuItemWithRating(menuItem, done){
    order_util.getMenuItemRating(menuItem.id).then(rating => {
            menuItem.rating = rating[0]['AVG']
        done()
    })
}



/**
 * Format menu item to json string
 * this function only includes the following property when converting:
 *  [image], [itemName], [rating], [price] 
 * 
 * @param menuItem - menu item
 * @return {string} json string of the menu item
 */
function formatMenuItemToIndexHandlebars(menuItem){
    return JSON.stringify({
            id: menuItem.id,
            image: menuItem.image,
            itemName: menuItem.itemName,
            rating: menuItem.rating,
            price: menuItem.price
        }
    )
}



/**
 * Format menu items array to json string
 * this function only includes the following property when converting:
 *  [image], [itemName], [rating], [price] 
 * 
 * @param menuItems - array of menu items
 * @return {string} json string of the menu items array
 */
function formatMenuItemsToIndexHandlebars(menuItems){
    return JSON.stringify(menuItems.map(menuItem => {
        return {
            id: menuItem.id,
            image: menuItem.image,
            itemName: menuItem.itemName,
            rating: menuItem.rating,
            price: menuItem.price
        }
    }
    ))
}


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
            menuItems = menuItems.filter((e) => e != null && e.active)
            //Need get ratings for all menuItems (Not that efficient due to the fact it has to grab rating for each menu item)
            includeMenuItemsWithRating(menuItems, () => {
                res.type('json')
                res.send(formatMenuItemsToIndexHandlebars(menuItems))
            })
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


module.exports = router