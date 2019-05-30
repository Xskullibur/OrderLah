//ExpressJS
const express = require('express');
const router = express.Router();

//MomentJS
const moment = require('moment')

//Global
//Models
const globalHandle = require('../../libs/global/global')
const Order = globalHandle.get('order');
const OrderItem = globalHandle.get('orderItem');
const MenuItem = globalHandle.get('menuItem');
const User = globalHandle.get('user');

//Sequelize and DB
const Sequelize = require('sequelize')
const db = globalHandle.get('db')

router.get('/currentOrders', (req, res, next) => {

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
        res.render('../views/stallOwner/currentOrders', {
            currentOrders
        });

    }).catch((err) => console.error(err));

});

router.get('/allOrders/:pageNo', (req, res, next) => {

    Order.count().then(orderCount => {
        const currentPage = req.params.pageNo;
        let offset = 0;
        let limit = 5;

        if (currentPage === 1) {
            offset = 0;
        } else {
            offset = (currentPage - 1) * 5
        }

        const pages = Math.ceil(orderCount / limit);

        Order.findAll({
            where: { status: 'Collection Confirmed' },
            offset,
            limit,
            order: Sequelize.col('orderTiming'),
            include: [{
                model: MenuItem
            }]
        }).then(allOrders => {
            // res.send(allOrders)
            res.render('../views/stallOwner/allOrders',{
                 pages, allOrders,
            })
        })


    })

});

router.get('/monthlySummary/:month/:year', (req, res, next) => {

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
                    // stallId: req.user.id
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