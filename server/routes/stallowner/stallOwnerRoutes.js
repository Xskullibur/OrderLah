//ExpressJS
const express = require('express');
const router = express.Router();

// Uploads for menu item
const fs = require('fs');
const multer = require('multer')
const storage = require('./upload');
const upload = multer({storage : storage })

//MomentJS
const moment = require('moment')

//Global
//Models
const globalHandle = require('../../libs/global/global')
const Order = globalHandle.get('order');
const MenuItem = globalHandle.get('menuItem');
const Stall = globalHandle.get('stall');
const User = globalHandle.get('user')

//Sequelize and DB
const Sequelize = require('sequelize')
const db = globalHandle.get('db')


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
            reject(err);
        })
    })
    return promise
}

//Current Orders
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

//All Orders
router.get('/allOrders/:pageNo', (req, res, next) => {

    getStallID(req.user.id).then(stallID => {
        //Get number of orders for pagination 
        Order.count({ where: { stallId: stallID } }).then(orderCount => {
            let currentPage = req.params.pageNo;
            let offset = 0;
            let limit = 5;
    
            if (currentPage === 1) {
                offset = 0;
            } else {
                offset = (currentPage - 1) * 5
            }
    
            const pages = Math.floor(orderCount / limit);
    
            /**
             * Get all Stall's Orders
             * Based on Stall's ID
             * Limited based on pagination items
             * WHERE Status = Collection Confirmed
             */
            Order.findAll({
                where: { status: 'Collection Confirmed', stallId: stallID },
                offset,
                limit,
                order: Sequelize.col('orderTiming'),
                include: [{
                    model: MenuItem
                }]
            }).then(allOrders => {
    
                currentPage = parseInt(currentPage)
    
                res.render('stallOwner/allOrders',{
                     pages, allOrders, currentPage,
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

    getStallID(req.user.id).then(stallID => {
        //Paramaters
        const inputMonthYear = `${req.params.monthYear}`
        let title = `Monthly Summary`
    
        //Get all months of stall where there are orders => month
        db.query(`SELECT DISTINCT date_format(orderTiming, "%M-%Y") AS uniqueDate FROM orderlah_db.orders WHERE orderlah_db.orders.stallId = ${stallID}`, { raw: true }).then(([month, metadata]) => {

            let monthYearSelected = false

            if (req.params.monthYear == undefined) {
                monthYearSelected = true;
                res.render('../views/stallOwner/monthlySummary',{
                    month, monthYearSelected, title
               })
            }
            else{

                title += ` (${moment(inputMonthYear).format("MMM-YYYY")})`

                const selectedMonth = moment(inputMonthYear).format('MM')
                const selectedYear = moment(inputMonthYear).format('YYYY')

                /**
                 * Get all orders
                 * BASED on provided Month and Year
                 */
                Order.findAll({
                    where: [
                        db.where(db.fn('MONTH', Sequelize.col('orderTiming')), selectedMonth),
                        db.where(db.fn('YEAR', Sequelize.col('orderTiming')), selectedYear),
                        {
                            status: {
                                [Sequelize.Op.or]: ['Collection Confirmed']
                            },
                            stallId: stallID
                        }
                    ],
                    order: Sequelize.col('orderTiming'),
                    include: [{
                        model: MenuItem
                    }]
                }).then(monthlyOrder => {
        
                    let formatedOrder = []
        
                    //Format JSON into a usable format
                    for (const i in monthlyOrder) {
                        if (monthlyOrder.hasOwnProperty(i)) {
        
                            const order = monthlyOrder[i];
                            const orderDate = moment(order.orderTiming).format("DD-MMM-YYYY") 
        
                            if (formatedOrder.length == 0) {
                                formatedOrder.push({orderDate: orderDate, orders: []})
                            }
        
                            let dateNotFound = true;
        
                            formatedOrder.forEach(object => {
        
                                if (object.orderDate == orderDate) {
                                    object.orders.push(order)
                                    dateNotFound = false
                                    return
                                }
        
                            });
        
                            if (dateNotFound) {
                                formatedOrder.push({orderDate: orderDate, orders: [order]})
                            }
                            
                        }
                    }
                    
                    res.render('../views/stallOwner/monthlySummary',{
                        month, formatedOrder, title
                   })
                })
            }
            
    
        })
    })

})

module.exports = router;