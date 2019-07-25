const moment = require('moment')

module.exports = {
    //Format Date
    formatDate(date, formatType){
        return moment(date).format(formatType);
    },

    //For Loop (Handlebars)
    for(input, block){

        const times = parseInt(input);

        let accum = '';
        for (let i = 1; i < times + 1; i++) {
            accum += block.fn(i)
            count = i
        }
        return accum;
    },
    
    jsonStringfy(context){
        return JSON.stringify(context)
    },

    ifEquals(input1, input2, trueOutput, falseOutput){
        return (input1 === input2) ? trueOutput : falseOutput;
    },

    /**
     * 
     * @param {any} input1 
     * @param {string} operator 
     * @param {any} input2 
     */
    ifCondition(input1, operator, input2, options){
        switch (operator) {

            case "contains":
                if (input1.includes(input2)) {
                    return options.fn(this)
                }
                return options.inverse(this)

            case "||":
                if (input1 || input2) {
                    return options.fn(this)
                }
                return options.inverse(this)

            case "==":
                if (input1 === input2) {
                    return options.fn(this)
                }
                return options.inverse(this)
        
            case ">":
                if (input1 > input2) {
                    return options.fn(this)
                }
                return options.inverse(this)
                
            case "<":
                if (input1 < input2) {
                    return options.fn(this)
                }
                return options.inverse(this)

            case ">=":
                if (input1 >= input2) {
                    return options.fn(this)
                }
                return options.inverse(this)

            case "<=":
                if (input1 <= input2) {
                    return options.fn(this)
                }
                return options.inverse(this)
        }

    },

    calcItemPrice(items){
        return (items.price * items.orderItem.quantity).toFixed(2)
    },

    calcOrderTotal(order){
        let sum = 0;
        order.menuItems.forEach(order => {
            sum += order.price*order.orderItem.quantity
        });
        return sum.toFixed(2);
    },

    calcDailyTotal(orders){
        let sum = 0
        
        for (const order in orders.orders) {
            if (orders.orders.hasOwnProperty(order)) {
                const orderItem = orders.orders[order];
                
                for (const item in orderItem.menuItems) {
                    if (orderItem.menuItems.hasOwnProperty(item)) {

                        const menuItem = orderItem.menuItems[item];
                        sum += menuItem.price * menuItem.orderItem.quantity
                        
                    }
                }

            }
        }

        return sum.toFixed(2)
    },

    calcMonthlyTotal(orders){
        let sum = 0;

        for (const order in orders) {
            if (orders.hasOwnProperty(order)) {
                const dailyOrder = orders[order];
                
                for (const orderItems in dailyOrder.orders) {
                    if (dailyOrder.orders.hasOwnProperty(orderItems)) {
                        const orderItem = dailyOrder.orders[orderItems];
                        
                        for (const menuItems in orderItem.menuItems) {
                            if (orderItem.menuItems.hasOwnProperty(menuItems)) {

                                const menuItem = orderItem.menuItems[menuItems];
                                sum += menuItem.price * menuItem.orderItem.quantity

                            }
                        }

                    }
                }

            }
        }

        return sum.toFixed(2)
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
    },

    inc(value, options) {
        return parseInt(value) + 1
    },
    
    substringTo5(text){
        return text.substring(0, 5)
    }
}