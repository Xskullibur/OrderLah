//ExpressJS
const express = require('express');
const router = express.Router();

//MomentJS
const moment = require('moment')

//Global
//Models
const globalHandle = require('../../libs/global/global')
const Order = globalHandle.get('order');
const MenuItem = globalHandle.get('menuItem');
const Stall = globalHandle.get('stall');

//Sequelize and DB
const Sequelize = require('sequelize')
const db = globalHandle.get('db')

//Function to get stallID based on logged in Stall Owner ID
function getStallID(userID) {
    Stall.findOne({
        attributes: [ 'id' ],
        where: {
            userId: userID
        }
    }).then(stall => {
        return stall.id
    })
}

//Current Orders
router.get('/currentOrders', (req, res, next) => {
    
    const stallID = getStallID(req.user.id)

    //Get stall's current orders based on StallID | Where status != Collection Completed
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

        //Render CurrentOrders2 Handlebars and pass currentOrders
        res.render('../views/stallOwner/currentOrders2', {
            currentOrders
        });

    }).catch((err) => console.error(err));

});

//All Orders
router.get('/allOrders/:pageNo', (req, res, next) => {

    const stallID = getStallID(req.user.id)

    //Get nunmber of orders for pagination 
    Order.count().then(orderCount => {
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
                    getPrevious(currentPg){
                        if (currentPg > 1) {
                            return currentPg - 1
                        }
                     },
                     getNext(currentPg){
                         if (currentPg < pages) {
                             return currentPg + 1
                         }
                     }, 
                }
            })
        })


    })

});

router.get('/monthlySummary/:month/:year', (req, res, next) => {

    const stallID = getStallID(req.user.id)

    const inputMonthYear = `${req.params.month}/01/${req.params.year}`
    const title = `Monthly Summary (${moment(inputMonthYear).format("MMM-YYYY")})`

    //Fill Months
    db.query(`SELECT DISTINCT date_format(orderTiming, "%M-%Y") AS uniqueDate FROM orderlah_db.orders`, { raw: true }).then(([month, metadata]) => {

        //Other Info
        Order.findAll({
            where: [
                db.where(db.fn('MONTH', Sequelize.col('orderTiming')), req.params.month),
                db.where(db.fn('YEAR', Sequelize.col('orderTiming')), req.params.year),
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

            // res.send(formatedOrder)
        })

    })

})

module.exports = router;