//ExpressJS
const express = require('express');
const router = express.Router();

//Global
const globalHandle = require('../libs/global/global')
const Order = globalHandle.get('order');
const OrderItem = globalHandle.get('orderItem');
const MenuItem = globalHandle.get('menuItem');

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

    // db.query(`SELECT orderlah_db.orders.id, orderlah_db.orders.orderTiming, orderlah_db.menuItems.id, orderlah_db.menuItems.itemName, orderlah_db.menuItems.price, orderlah_db.orderItems.quantity
    // FROM orderlah_db.menuItems, orderlah_db.orderItems, orderlah_db.orders
    // WHERE orderlah_db.orderItems.menuItemId = orderlah_db.menuItems.id AND orderlah_db.orderItems.orderId = orderlah_db.orders.id AND orderlah_db.orders.status != 'Collection Confirmed'
    // ORDER BY orderlah_db.orders.orderTiming`, { type: Sequelize.QueryTypes.SELECT }).then(currentOrders => {

    //     // res.send(currentOrders)

    //     res.render('../views/stallOwner/currentOrders', {
    //         helpers: {
    //             calcTotal(order){
    //                 let sum = 0;
    //                 order.orderItem.forEach(order => {
    //                     sum += order.price*order.quantity
    //                 });
    //                 return sum;
    //             }
    //         },
    //         currentOrders
    //     });

    // })

    Order.findAll({
        where: {
            status: {
                [Sequelize.Op.or]: ['Order Pending', 'Preparing Order', 'Ready For Collection',]
            }
        },
        order: Sequelize.col('orderTiming'),
        include:[{
            model: OrderItem,
            where: { orderId: Sequelize.col('order.id') }
        }]
    }).then(currentOrders => {

        // res.send(currentOrders)

        res.render('../views/stallOwner/currentOrders', {
            // helpers: {
            //     calcTotal(order){
            //         let sum = 0;
            //         order.orderItem.forEach(order => {
            //             sum += order.price*order.quantity
            //         });
            //         return sum;
            //     }
            // },
            currentOrders
        });
    })

});

module.exports = router;