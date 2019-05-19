const express = require('express');
const router = express.Router();

router.get('/currentOrders', (req, res, next) => {

    const now = new Date();

    const orders = [{
        orderId: 1,
        orderTiming: now.toDateString() + ", " + now.toLocaleTimeString(),
        orderItem: [{
            itemName: 'Chicken Rice',
            price: 2.50,
            quantity: 2,
        },
        {
            itemName: 'Duck Rice',
            price: 3.00,
            quantity: 1
        }],
    },
    {
        orderId: 2,
        orderTiming: now.toDateString() + ", " + now.toLocaleTimeString(),
        orderItem: [{
            itemName: 'Nosla\'s Supreme Chicken Cutlet Black Rice',
            price: 10,
            quantity: 1,
        },
        {
            itemName: 'Wanton Noodle',
            price: 4.50,
            quantity: 3,
        }]
    },
    {
        orderId: 3,
        orderTiming: now.toDateString() + ", " + now.toLocaleTimeString(),
        orderItem: [{
            itemName: 'Nosla\'s Supreme Chicken Cutlet Black Rice',
            price: 10,
            quantity: 1,
        },
        {
            itemName: 'Wanton Noodle',
            price: 4.50,
            quantity: 3,
        }]
    }]

    res.render('../views/stallOwner/currentOrders', {
        helpers: {
            calcTotal(order){
                let sum = 0;
                order.orderItem.forEach(order => {
                    sum += order.price*order.quantity
                });
                return sum;
            }
        },
        orders
    });
});

module.exports = router;