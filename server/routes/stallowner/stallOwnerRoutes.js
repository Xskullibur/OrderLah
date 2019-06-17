//ExpressJS
const express = require('express');
const router = express.Router();

// Uploads for menu item
const fs = require('fs');
const multer = require('multer')
const storage = require('./upload');
const upload = multer({storage : storage })

//Login authentication middleware
const auth_login = require('../../libs/auth_login')

//MomentJS
const moment = require('moment')

//Global
//Models
const globalHandle = require('../../libs/global/global')
const Order = globalHandle.get('order');
const MenuItem = globalHandle.get('menuItem');
const Stall = globalHandle.get('stall');
const User = globalHandle.get('user')

//Get App
const app = globalHandle.get('app')

//Sequelize and DB
const Sequelize = require('sequelize')
const db = globalHandle.get('db')

router.use(auth_login.authStallOwner)

/**
 * ALSON ROUTES 
 */

//Get StallID based on logged in Stall Owner ID
function getStallID(userID) {
    let promise = new Promise((resolve, reject)=>{
        Stall.findOne({
            attributes: [ 'id' ],
            where: {
                userId: userID
            }
        }).then(stall => {
            resolve(stall.id)
        }).catch((err) => {
            console.log('ERROR')
        })
    })
    return promise
}

//Current Orders Route
router.get('/', (req, res, next) => {
    
    //Get Stall ID
    getStallID(req.user.id).then((stallID) => {

        /**
        * Get Current Orders
        * Based on Stall ID received by function
        * WHERE Status != Collection Completed
        */
        Order.findAll({
            where: {
                status: {
                    [Sequelize.Op.or]: ['Order Pending', 'Preparing Order', 'Ready For Collection',]
                },
                stallId: stallID
            },
            order: Sequelize.col('orderTiming'),
            include: [{
                model: MenuItem
            }]

        }).then((currentOrders) => {

            res.render('stallOwner/currentOrders2', {
                currentOrders
            });

        }).catch((err) => console.error(err));

    })

});

//All Orders Route
router.get('/allOrders/:pageNo/', (req, res, next) => {


    //Check for filters
    let orderFilter = req.query.orderNo
    let dateFilter = req.query.orderDate
    let filter = false

    if (orderFilter && dateFilter) {
        error = "Please fill one filter only..."
    }
    else if (orderFilter){
        if (isNaN(orderFilter)) {
            error = "Please input a valid Order Number"
        }
        filterCondition = { id: orderFilter }
        filter = true
    }
    else if (dateFilter) {
        if (!Date.parse(dateFilter)) {
            error = "Please input a valid Order Date"
        }
        filterCondition = db.where(db.fn('DATE', Sequelize.col('orderTiming')), dateFilter)
        filter = true
    }

    //Get StallID of logged in stallowner
    getStallID(req.user.id).then(stallID => {

        whereCondition = [{stallId: stallID, status: 'Collection Confirmed'}]

        if (filter) {
            whereCondition.push(filterCondition)
        }

        //Get total number of orders for the Stall
        Order.count({ where: whereCondition }).then(orderCount => {

            let currentPage = req.params.pageNo;                // Current page user is on
            let offset = 0;                                     // Starting index of items
            let limit = 5;                                      // Number of items per page
            const pages = Math.ceil(orderCount / limit);       // Get the number of pages rounded down

    
            /**
             * If user is not on 1st page,
             * calculate offset based on
             * currentPage * limit (number of items per page)
             */
            if (currentPage !== 1) {
                offset = (currentPage - 1) * limit
            }

            // Get paginated orders
            Order.findAll({
                where: whereCondition,                          // Filtered based on Status and Stall
                offset,
                limit,
                order: Sequelize.col('orderTiming'),
                include: [{
                    model: MenuItem
                }]
            }).then(allOrders => {
    
                currentPage = parseInt(currentPage)
    
                res.render('stallOwner/allOrders',{
                     pages, allOrders, currentPage, orderFilter, dateFilter,
                     helpers: {
    
                        //Pagination previous button Helper
                        getPrevious(currentPg){
                            if (currentPg > 1) {
                                return currentPg - 1
                            }
                         },
    
                         //Pagination next button Helper
                         getNext(currentPg){
                             if (currentPg < pages) {
                                 return currentPg + 1
                             }
                         }, 
                    }
                })
            })
    
    
        })
    })

});

//Monthly Summary
router.get('/monthlySummary/:monthYear?/', (req, res, next) => {

    //Get StallID based onlogged in user
    getStallID(req.user.id).then(stallID => {

        const inputMonthYear = `${req.params.monthYear}`                // Get submitted Month-Year from paramaters
        let title = `Monthly Summary`                                   // Default Title
    
        // Get date (Month-Year) where the stall has received orders
        db.query(`SELECT DISTINCT date_format(orderTiming, "%M-%Y") AS uniqueDate FROM orderlah_db.orders WHERE orderlah_db.orders.stallId = ${stallID}`, { raw: true }).then(([month, metadata]) => {

            let dateNotSelected = false                                 // Bool to indicate if a date(Month-Year) is selected

            if (req.params.monthYear == undefined) {                    // Check if date(Month-Year) is selected
                dateNotSelected = true;                                 // Indicate that a date(Month-Year) is selected
                res.render('../views/stallOwner/monthlySummary',{       // Render page w/o pulling data
                    month, dateNotSelected, title
               })
            }
            else{                                                               // date(Month-Year) indicated

                let selectedDate = moment(inputMonthYear).format("MMMM-YYYY")
                title += ` (${selectedDate})`      // Update title to include date(Month-Year)

                const selectedMonth = moment(inputMonthYear).format('MM')       // Get Month from received date(Month-Year)
                const selectedYear = moment(inputMonthYear).format('YYYY')      // Get Year from received date(Month-Year)

                /**
                 * Get all orders
                 * BASED on provided date(Month-Year)
                 */
                Order.findAll({
                    where: [
                        db.where(db.fn('MONTH', Sequelize.col('orderTiming')), selectedMonth),      // Extract Month from orderTiming for Querying with selectedMonth
                        db.where(db.fn('YEAR', Sequelize.col('orderTiming')), selectedYear),        // Extract Year from orderTiming for Querying with selectedYear
                        {
                            status: 'Collection Confirmed',             // Get Orders where its status is 'Collection Confirmed'
                            stallId: stallID                            // Orders that belongs to the logged in Stall Owner
                        }
                    ],
                    order: Sequelize.col('orderTiming'),                // Sort the orders according to the orderTiming
                    include: [{
                        model: MenuItem                                 // Join the MenuItem Table (Including OrderItems)
                    }]
                }).then(monthlyOrder => {
        
                    let formatedOrder = []
        
                    /**
                     * Format JSON into a usable format
                     * {
                     *      orderDate: someDate,
                     *      orders: [
                     *          {
                     *              order Info,
                     *              menuItems: [
                     *                  menuItem Info
                     *              ]
                     *          },
                     *          {
                     *              order Info,
                     *              menuItems: [
                     *                  menuItem Info
                     *              ]
                     *          },
                     *      ]
                     * }
                     */
                    for (const i in monthlyOrder) {                     // Loop through each orders
                        if (monthlyOrder.hasOwnProperty(i)) {           // Check if orders exist
        
                            const order = monthlyOrder[i];              
                            const orderDate = moment(order.orderTiming).format("DD-MMM-YYYY")       // Extract date from orderTiming(datetime)
        
                            if (formatedOrder.length == 0) {                                        // Push the first object if formatedOrder is empty
                                formatedOrder.push({orderDate: orderDate, orders: []})
                            }
        
                        let dateNotFound = true;                            // Variable to check if date is found in formatedOrder
        
                            formatedOrder.forEach(object => {
        
                                if (object.orderDate == orderDate) {        // Push order info into the added date if the date already exist
                                    object.orders.push(order)
                                    dateNotFound = false                    // Update variable for the next condition
                                    return
                                }
        
                            });
        
                            if (dateNotFound) {
                                formatedOrder.push({orderDate: orderDate, orders: [order]})
                            }
                            
                        }
                    }

                    res.render('../views/stallOwner/monthlySummary',{
                        month, formatedOrder, title, selectedDate
                   })
                })
            }
            
    
        })
    })

})


/**
 * ALSON LOGIC ROUTES
 */
const STATUS = {
    OrderPending: 'Order Pending',
    PreparingOrder: 'Preparing Order',
    ReadyForCollection: 'Ready for Collection',
    CollectionConfirmed: 'Collection Confirmed'
}

function getUpdateStatus(status) {
    switch (status) {

        case STATUS.OrderPending:
            return STATUS.PreparingOrder

        case STATUS.PreparingOrder:
            return STATUS.ReadyForCollection

        case STATUS.ReadyForCollection:
            return STATUS.CollectionConfirmed

    }
}

router.post('/updateStatus/:orderID', (req, res) => {
    
    const orderID =  req.params.orderID

    //Get Order
    Order.findOne({
        where: {
            id: orderID
        }
    }).then(order => {

        let status = getUpdateStatus(order.status)

        Order.update({
            status
        }, 
        { 
            where: { id: orderID } 
        }).then(() => {
            res.redirect('/stallOwner/')
        })

    })

})


/**
 * HSIEN XIANG ROUTES
 */

router.get('/showMenu', (req, res) => {
    const id = req.user.id
    User.findOne({ where: id }).then(user => {
        if (user.role === 'Admin') {
            MenuItem.findAll({where: { active: true}}).then((item) =>{
                res.render('stallowner-menu', {
                    item:item
                })
            })
        }else if(user.role === 'Stallowner'){
            MenuItem.findAll({where: {owner: req.user.id, active: true}}).then((item) =>{
                res.render('stallowner-menu', {
                    item:item
                })
            })      
        }else{
            res.render('error')
        }      
      })
    



    //res.render('stallowner-menu')
})

router.get('/adminPanel', auth_login.authAdmin, (req, res) =>{
    User.findAll({where: {role: "Stallowner"}}).then((stallowner) =>{
        res.render('admin', {
            displayStallowner: stallowner
        })
    })
})

// router.post('/submitStall',  (req, res) =>{
//     const username = req.body.username
//     const firstName = req.body.firstName
//     const lastName = req.body.lastName
//     const email = req.body.email
//     const birthday = req.body.birthday
//     const password = req.body.password
//     const phone = req.body.phone
//     const role = 'Stallowner'

//     User.create({
//         username, firstName, lastName, email, birthday, password, phone, role
//     }).then(function(){
//         res.send('good')
//     }).catch(err => console.log(err))

// })

router.post('/submitItem', auth_login.authStallOwner, upload.single("itemImage"), (req, res) =>{
    const itemName = req.body.itemName
    const price = req.body.itemPrice
    const itemDesc = req.body.itemDescription
    const owner = req.user.id
    const active = true

    if (!fs.existsSync('./public/uploads')){
        fs.mkdirSync('./public/uploads');
    }

    

    MenuItem.create({ itemName, price, itemDesc, owner, active}).then(function() {
        // alert("Item successfully added")
        //res.send('Good')
        res.render('createSuccess')
    }).catch(err => console.log(err))
})

router.post('/deleteItem', auth_login.authStallOwner, (req, res) =>{
    const active = false
    const id = req.user.id
    MenuItem.update({active}, {where: id}).then(
    function(){res.send('item removed')}).catch(err => console.log(err))
    
})

// router.post('/updateItem', upload.single("itemImage"), (req, res) =>{
//     const itemName = req.body.itemName
//     const price = req.body.itemPrice
//     const itemDesc = req.body.itemDescription

//     MenuItem.update({itemName, price, itemDesc},{where:{id: req.body.id}})
// })


module.exports = router;