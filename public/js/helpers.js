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
}