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
const OrderItem = globalHandle.get('orderItem')

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

        User.findOne({
            where: {
                id: userID
            },
            include: [{
                model: Stall
            }]
        }).then(stall => {
            resolve(stall)
        }).catch((err) => {
            console.log(`ERROR: ${err}`)
        })

        // Stall.findOne({
        //     where: {
        //         userId: userID
        //     },
        //     include: [{
        //         model: User
        //     }]
        // }).then(stall => {
        //     resolve(stall)
        // }).catch((err) => {
        //     console.log(`ERROR: ${err}`)
        // })
    })
    return promise
}

//Current Orders Route
router.get('/', (req, res, next) => {
    
    //Get Stall ID
    getStallID(req.user.id).then((stallOwner) => {

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
                stallId: stallOwner.stall.id
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
    let error

    if (orderFilter && dateFilter) {
        error = "Only one filter is allowed to be applied..."
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
    getStallID(req.user.id).then(stallOwner => {

        whereCondition = [{stallId: stallOwner.stall.id, status: 'Collection Confirmed'}]

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
                     pages, allOrders, currentPage, orderFilter, dateFilter, error,
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
    getStallID(req.user.id).then(stallOwner => {

        const inputMonthYear = `${req.params.monthYear}`                // Get submitted Month-Year from paramaters
        let title = `Monthly Summary`                                   // Default Title
    
        // Get date (Month-Year) where the stall has received orders
        db.query(`SELECT DISTINCT date_format(orderTiming, "%M-%Y") AS uniqueDate FROM orderlah_db.orders WHERE orderlah_db.orders.stallId = ${stallOwner.stall.id}`, { raw: true }).then(([month, metadata]) => {

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
                            stallId: stallOwner.stall.id                         // Orders that belongs to the logged in Stall Owner
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
                        month, formatedOrder, title, selectedDate, stallOwner
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

router.use(auth_login.auth)

var displayAlert = []

router.get('/showMenu', (req, res) => {
    const id = req.user.id
    User.findOne({ where: id }).then(user => {
         if(user.role === 'Stallowner'){
            Stall.findOne({where: {userId: id}}).then(myStall => {
                MenuItem.findAll({where: {stallId: myStall.id, active: true}}).then((item) =>{
                    res.render('stallowner-menu', {
                        item:item,
                        stall: myStall,
                        displayAlert: displayAlert
                    })
                    displayAlert = []
                })    
            })
        }else{
            res.render('./successErrorPages/error')
        }      
      })
})

router.post('/submitItem', auth_login.authStallOwner, upload.single("itemImage"), (req, res) =>{
    const currentUser = req.user.id

    Stall.findOne({where: {userId : currentUser}}).then(theStall =>{
        const itemName = req.body.itemName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n")     
        const price = req.body.itemPrice
        const itemDesc = req.body.itemDescription.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n") 
        const owner = req.user.id
        const active = true
        const image = currentUser+itemName.replace(/\s/g, "")+'.jpeg'
        const stallId = theStall.id

        // if (!fs.existsSync('./public/uploads')){
        //     fs.mkdirSync('./public/uploads');
        // }

        MenuItem.create({ itemName, price, itemDesc, owner, active, image, stallId}).then(function(){
            //res.render('./successErrorPages/createSuccess')
            displayAlert.push('Item successfully added')
            res.redirect('/stallOwner/showMenu')
        }).catch(err => console.log(err))
    })
})

router.post('/deleteItem', auth_login.authStallOwner, (req, res) =>{
    displayAlert.push('Item deleted!')
    const active = false
    const id = req.body.itemID
    MenuItem.update({active}, {where:{id}}).then(function(){
        //res.render('./successErrorPages/removeSuccess')
        res.redirect('/stallOwner/showMenu')
    }).catch(err => console.log(err))
})

router.post('/updateItem', auth_login.authStallOwner, upload.single("itemImage"), (req, res) =>{   
    const currentUser = req.user.id
    const itemName = req.body.itemName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n")
    const price = req.body.itemPrice
    const itemDesc = req.body.itemDescription.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n")
    const image = currentUser+itemName.replace(/\s/g, "")+'.jpeg'
    const id = req.body.itemID
    var imageName = req.body.imgName

    // if (!fs.existsSync('./public/uploads')){
    //     fs.mkdirSync('./public/uploads');
    // }

    

    MenuItem.update({ itemName, price, itemDesc, image}, {where:{id}}).then(function() {
        //res.render('./successErrorPages/updateSuccess')
        fs.rename(process.cwd()+'/public/img/uploads/'+ imageName, process.cwd()+'/public/img/uploads/'+currentUser+itemName.replace(/\s/g, "")+'.jpeg', function(err){
            if(err){
                console.log(err)
            }
        })
        displayAlert.push('Item updated!')
        res.redirect('/stallOwner/showMenu')
    }).catch(err => console.log(err))
})

router.post('/viewComment', auth_login.authStallOwner, (req, res) => {
    const itemID = req.body.itemID
    console.log(itemID)
    const id = req.user.id
    MenuItem.findOne({where : {id: itemID}}).then(menu =>{
        User.findOne({ where: id }).then(user => {
            if(user.role === 'Stallowner'){
               OrderItem.findAll({where: {menuItemId: itemID}}).then((items) =>{
                   res.render('stallmenu-comment', {
                       items: items,
                       menu: menu
                   })
               })
           }else{
               res.render('./successErrorPages/error')
           }      
         })
    })   
})

module.exports = router;