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

//Setup uuid for csrf authentication
const uuid_middleware = require('../../libs/uuid_middleware')

//MomentJS
const moment = require('moment')

// Utils
const order_util = require('../../utils/stallowner/order')
const update_util = require('../../utils/stallowner/update_status')

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
const SqlString = require('sequelize/lib/sql-string')
const db = globalHandle.get('db')

var validator = require('validator')

router.use(auth_login.authStallOwner)

/**
 * ALSON ROUTES 
 */

//Current Orders Route
router.get('/', uuid_middleware.generate, (req, res) => {
    
    //Get Stall ID
    order_util.getStallInfo(req.user.id).then((stallOwner) => {

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
                currentOrders,
                nav: 'currentOrders'
            });

        }).catch((err) => console.error(err));

    })

});

//Monthly Summary
router.get('/monthlySummary/:monthYear?/', (req, res, next) => {

    //Get StallID based onlogged in user
    order_util.getStallInfo(req.user.id).then(stallOwner => {

        const inputMonthYear = `${req.params.monthYear}`                // Get submitted Month-Year from paramaters
        let title = `Monthly Summary`                                   // Default Title
    
        // Get date (Month-Year) where the stall has received orders
        db.query(`SELECT DISTINCT date_format(orderTiming, "%M-%Y") AS uniqueDate FROM orderlah_db.orders WHERE orderlah_db.orders.stallId = ${stallOwner.stall.id}`, { raw: true }).then(([month, metadata]) => {

            let dateNotSelected = false                                 // Bool to indicate if a date(Month-Year) is selected

            if (req.params.monthYear == undefined) {                    // Check if date(Month-Year) is selected
                dateNotSelected = true;                                 // Indicate that a date(Month-Year) is selected
                res.render('../views/stallOwner/monthlySummary',{       // Render page w/o pulling data
                    month, dateNotSelected, title,
                    nav: 'monthlySummary'
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

                    res.render('stallOwner/monthlySummary',{
                        month, formatedOrder, title, selectedDate, stallOwner,
                        nav: 'monthlySummary'
                    })
                })
            }
            
    
        })
    })

})

// Orders
router.get('/orderDetails/allOrders/:pageNo/', (req, res, next) => {

    //Check for filters
    let orderFilter = req.query.orderNo
    let dateFilter = req.query.orderDate
    let title = "Orders"
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
    order_util.getStallInfo(req.user.id).then(stallOwner => {

        whereCondition = [{stallId: stallOwner.stall.id, status: 'Collection Confirmed'}]

        if (filter) {
            whereCondition.push(filterCondition)
            title += " (Filtered)"
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
                     pages, allOrders, currentPage, orderFilter, dateFilter, error, title,
                     nav: 'orderDetails',
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

// Charts
router.get('/orderDetails/charts/', (req, res) =>{
    
    toDate = null
    frDate = null

    filter = false
    title = "Charts"
    fitlerStatement = ""
    
    if (req.query.toDate || req.query.frDate) {
        toDate = SqlString.escape(req.query.toDate);
        frDate = SqlString.escape(req.query.frDate);
        filter = true
        fitlerStatement = ` AND DATE(orders.orderTiming) BETWEEN '${frDate}' AND '${toDate}' `    
    }

    function getStallOwner() {
        return new Promise(function(resolve, reject) {
            order_util.getStallInfo(req.user.id).then(stallOwner => {
                resolve(stallOwner);
            }).catch(err => {
                reject(err)
            })
        })
    }

    function getOrdersPerItem(stallOwner) {
        return new Promise(function(resolve, reject) {

            db.query(`SELECT orderlah_db.menuItems.itemName ItemName, COUNT(orderItems.menuItemId) AS NoOfOrders
            FROM orderlah_db.orderItems
            INNER JOIN orderlah_db.menuItems ON orderlah_db.orderItems.menuItemId = orderlah_db.menuItems.id
            INNER JOIN orderlah_db.orders ON orderlah_db.orderItems.orderId = orders.id
            WHERE orders.stallId = ${stallOwner.stall.id}
            AND orders.status = 'Collection Confirmed'
            ${fitlerStatement}
            GROUP BY orderlah_db.orderItems.menuItemId`).then(([result, metadata]) => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })

        })   
    }

    function getAvgRatingPerItem(stallOwner){
        return new Promise(function(resolve, reject) {

            db.query(`SELECT menuItems.itemName, AVG(orderItems.rating)-1 AS average
            FROM orders
            INNER JOIN orderItems ON orders.id = orderItems.orderId
            INNER JOIN menuItems ON orderItems.menuItemId = menuItems.id
            WHERE orders.stallId = ${stallOwner.stall.id}
            AND orders.status = 'Collection Confirmed'
            ${fitlerStatement}
            GROUP BY menuItems.id`).then(([result, metadata]) => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })

        })
    }


    // Get Rating Count
    function getRatingCount(menuItemId, rating) {

        menuItemId = SqlString.escape(menuItemId);
        rating = SqlString.escape(rating);

        return new Promise(function(resolve, reject) {
            db.query(`SELECT COUNT(orderItems.menuItemId) AS Rating
			FROM orders
            INNER JOIN orderItems ON orders.id = orderItems.orderId
            WHERE orderItems.menuItemId = ${menuItemId}
            AND orderItems.rating  = '${rating}'
            AND orders.status = 'Collection Confirmed' ${fitlerStatement}`).then(([result, metadata]) => {
                resolve(result[0].Rating)
            }).catch(err => {
                reject(err)
            })
        })

    }

    // Get Ratings for each item
    function getEachItemRating(stallOwner) {

        return new Promise(function(resolve, reject) {
            order_util.getStallOwnerMenuItems(stallOwner.stall.id).then(async ([allItems, metadata]) => {
                EachItemRating = []
    
                for (const key in allItems) {
                    if (allItems.hasOwnProperty(key)) {
                        const item = allItems[key];

                        line = {}

                        line.id = item.id
                        line.itemName = item.itemName
        
                        rating5 = await getRatingCount(item.id, 5)
                        rating4 = await getRatingCount(item.id, 4)
                        rating3 = await getRatingCount(item.id, 3)
                        rating2 = await getRatingCount(item.id, 2)
                        rating1 = await getRatingCount(item.id, 1)
        
                        line.rating = [
                            {
                                label: "5 Stars",
                                count: rating5
                            },
                            {
                                label: "4 Stars",
                                count: rating4
                            },
                            {
                                label: "3 Stars",
                                count: rating3
                            },
                            {
                                label: "2 Stars",
                                count: rating2
                            },
                            {
                                label: "1 Stars",
                                count: rating1
                            },
                        ]
        
                        EachItemRating.push(line)
                    }
                }

                resolve(EachItemRating)
            }).catch(err => {
                reject(err)
            })
            
        })

    }

    async function main() {

        StallOwner = await getStallOwner()                                                          

        OrdersPerItem = await getOrdersPerItem(StallOwner)
        AvgRatingPerItem = await getAvgRatingPerItem(StallOwner)
        EachItemRating = await getEachItemRating(StallOwner)

        if (filter == true) {
            title += " (Filtered)"
        }

        // res.send(EachItemRating)
        res.render('stallOwner/orderCharts', {
            OrdersPerItem, AvgRatingPerItem, EachItemRating, title, frDate, toDate,
            nav: 'orderDetails'
        });
    }

    main()

})

// Ratings
router.get('/orderDetails/ratings/', (req, res) => {

    title = "Ratings"
    allRatings = []
    menu_items = {}
    item_filter = null
    rating_filter = null

    function getFilters() {

        filters = false

        if (req.query.item_filter) {
            item_filter = parseInt(req.query.item_filter)
            filters = true
        }

        if (req.query.rating_filter) {
            rating_filter = parseInt(req.query.rating_filter)  
            filters = true
        }

        if (filters == true) {
            title += " (Filtered)"
        } 
    }

    async function main() {

        await getFilters()

        // Get logged in stall owner
        let stallOwner = await order_util.getStallInfo(req.user.id)

        // Get menu items belonging to stall owner
        await order_util.getStallOwnerMenuItems(stallOwner.stall.id)
            .then( async ([menuItems, metadata]) => {

                menu_items = menuItems

                for (const item in menuItems) {
                    if (menuItems.hasOwnProperty(item)) {
                        const menuItem = menuItems[item];
    
                        // If filter exist
                        if (item_filter) {
                            if (item_filter == menuItem.id) {
                                newLine = {}

                                //Push ID and Item Name into new line
                                newLine.id = menuItem.id
                                newLine.itemName = menuItem.itemName
            
                                // Get ratings for each items and push into new line 
                                await order_util.getMenuItemRatings(menuItem.id, item_filter, rating_filter).then(([ratings, metadata]) => {
                                    newLine.ratings = ratings
                                })
            
                                // Push newline into allRatings
                                allRatings.push(newLine)
                            }
                        }
                        else{
                            newLine = {}

                            //Push ID and Item Name into new line
                            newLine.id = menuItem.id
                            newLine.itemName = menuItem.itemName
        
                            // Get ratings for each items and push into new line 
                            await order_util.getMenuItemRatings(menuItem.id, item_filter, rating_filter).then(([ratings, metadata]) => {
                                newLine.ratings = ratings
                            })
        
                            // Push newline into allRatings
                            allRatings.push(newLine)
                        }

                    }
                }

        })

        // res.send(items)

        res.render('stallOwner/ratingsView', {
            allRatings, title, menu_items, item_filter, rating_filter,
            nav: 'orderDetails'
        })

    }

    main()

})

/**
 * HSIEN XIANG ROUTES
 */

router.use(auth_login.auth)
const op = Sequelize.Op
var displayAlert = []
var errorAlert = []

function toCap(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' ')
 }

function checkUnique(theName){
    return MenuItem.count({where: {itemName: theName, active: true}}).then(count =>{
        if(count !== 0){
            return false
        }
        return true
    })
}

router.get('/showMenu', uuid_middleware.generate, (req, res) => {
    const id = req.user.id
    User.findOne({ where: id }).then(user => {
         if(user.role === 'Stallowner'){
            Stall.findOne({where: {userId: id}}).then(myStall => {
                MenuItem.findAll({where: {stallId: myStall.id, active: true}}).then((item) =>{
                    res.render('stallOwner/stallowner-menu', {
                        item:item,
                        stall: myStall,
                        displayAlert: displayAlert,
                        errorAlert: errorAlert,
                        nav: 'manageMenu'
                    })
                    displayAlert = []
                    errorAlert = []
                })    
            })
        }else{
            res.render('./successErrorPages/error', {
                nav: 'manageMenu'
            })
        }      
      })
})

router.post('/submitItem', [upload.single("itemImage"), uuid_middleware.verify], (req, res) =>{
    const currentUser = req.user.id
    const itemName = toCap(req.body.itemName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n"))     
    const price = req.body.itemPrice
    const itemDesc = req.body.itemDescription.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n") 
    const active = true
    const image = currentUser+itemName.replace(/\s/g, "")+'.jpeg'
    checkUnique(itemName).then(isUnique => {
        if(isUnique){
            if(validator.isFloat(price) && !validator.isEmpty(itemName) && !validator.isEmpty(price)
            && !validator.isEmpty(itemDesc)){
                Stall.findOne({where: {userId : currentUser}}).then(theStall =>{
                    const stallId = theStall.id
            
                    MenuItem.create({ itemName, price, itemDesc, owner:currentUser, active, image, stallId}).then(function(){
                        displayAlert.push('Item successfully added')
                        res.redirect('/stallOwner/showMenu')
                    }).catch(err => console.log(err))
                })
            }else{
                res.send('validation check failed')
            }
        }else{
            errorAlert.push('The name ' + itemName + ' is already taken, item not added!')
            res.redirect('/stallOwner/showMenu')
        }
    })
})

router.post('/deleteItem', uuid_middleware.verify, (req, res) =>{
    displayAlert.push('Item deleted!')
    const active = false
    const id = req.body.itemID
    MenuItem.update({active}, {where:{id}}).then(function(){
        //res.render('./successErrorPages/removeSuccess')
        res.redirect('/stallOwner/showMenu')
    }).catch(err => console.log(err))
})

router.post('/updateItem', [upload.single("itemImage"), uuid_middleware.verify], (req, res) =>{   
    const currentUser = req.user.id
    const itemName = toCap(req.body.itemName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n"))
    const price = req.body.itemPrice
    const itemDesc = req.body.itemDescription.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n")
    const image = currentUser+itemName.replace(/\s/g, "")+'.jpeg'
    const id = req.body.itemID
    var checkName = toCap(req.body.checkName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n"))
    var imageName = req.body.imgName

    checkUnique(itemName).then(isUnique => {
        if(isUnique || (checkName === itemName)){
            MenuItem.update({ itemName, price, itemDesc, image}, {where:{id}}).then(function() {
                fs.rename(process.cwd()+'/public/img/uploads/'+ imageName, process.cwd()+'/public/img/uploads/'+currentUser+itemName.replace(/\s/g, "")+'.jpeg', function(err){
                    if(err){
                        console.log(err)
                    }
                })
                displayAlert.push('Item updated!')
                res.redirect('/stallOwner/showMenu')
            }).catch(err => console.log(err))
        }else{
            errorAlert.push('The name ' + itemName + ' is already taken, item not updated!')
            res.redirect('/stallOwner/showMenu')
        }
    })
})

router.post('/filterItem', (req, res) =>{
    var filterName = '%' + toCap(req.body.filterName.replace(/(^\s*)|(\s*$)/gi, ""). replace(/[ ]{2,}/gi, " ").replace(/\n +/, "\n")) + '%'
    const id = req.user.id
    User.findOne({ where: id }).then(user => {
         if(user.role === 'Stallowner'){
            Stall.findOne({where: {userId: id}}).then(myStall => {
                MenuItem.findAll({where: {stallId: myStall.id, active: true, itemName:{[op.like]: filterName}}}).then((item) =>{
                    res.render('stallOwner/stallowner-menu', {
                        item:item,
                        stall: myStall,
                        errorAlert: errorAlert,
                        nav: 'manageMenu'
                    })
                    errorAlert = []
                })    
            })
        }else{
            res.render('./successErrorPages/error')
        }      
      })
})

router.get('/showAddMenu', uuid_middleware.generate, (req, res) =>{
    res.render('stallOwner/stallOwnerModel/addMenuModel', {layout: 'empty_layout'})
})

router.post('/showEditMenu', uuid_middleware.generate, (req, res) =>{
    res.render('stallOwner/stallOwnerModel/editMenuModel', {layout: 'empty_layout'})
})

module.exports = router;