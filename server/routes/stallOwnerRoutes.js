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
            }
        },
        order: Sequelize.col('orderTiming'),
        include: [{
            model: MenuItem
        }]

    }).then((currentOrders) => {
        // res.send(currentOrders);

        const testImg = process.cwd() + '/public/img/no-image'
        res.render('../views/stallOwner/currentOrders', {
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

});

module.exports = router;