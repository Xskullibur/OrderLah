//ExpressJS
const express = require('express');
const router = express.Router();

//MomentJS
const moment = require('moment')

//Global
const globalHandle = require('../libs/global/global')
const Order = globalHandle.get('order');
const OrderItem = globalHandle.get('orderItem');
const MenuItem = globalHandle.get('menuItem');
const User = globalHandle.get('user');

//Sequelize
const Sequelize = require('sequelize')
const process = require('process')
const connection_details = {
    host: process.env.DB_HOST,
    database: "orderlah_db",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
}
const db = new Sequelize(connection_details.database, connection_details.username, connection_details.password, {
    host: connection_details.host,
    dialect: 'mysql',

    define: {
        timestamps: false
    },

    pool:{
        max: 15, // MAX of 15 concurrent connections
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

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

router.get('/monthlySummary', (req, res, next) => {

    db.query(`SELECT DISTINCT date_format(orderTiming, "%M-%Y") FROM orderlah_db.orders`, { raw: true }).then(dates => {

        res.send(dates)

        // res.render('../views/stallOwner/monthlySummary',{
        //     dates,
        // })
    })

})

module.exports = router;