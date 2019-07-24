//User
const user = require('./server/utils/main/user')

//Stall
const menu_item = require('./server/utils/main/menu_item')
const order_util = require('./server/utils/stallowner/order')
const cusine = require('./server/utils/stallowner/cusine')
const stall = require('./server/utils/stallowner/stall')

// Default Values
function getRandomDate() {
    start = new Date(1980, 0, 1)
    end = new Date(2000, 11, 31)

    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomNumberInRange(start, end) {
    return Math.floor(Math.random() * end - start)
}

const previousDate = new Date()
previousDate.setDate(previousDate.getDate() - 1)

const previousMonth = new Date()
previousMonth.setMonth(previousMonth.getMonth() - 1)

const pw = "test"
const custEmail = "@customer"
const stallEmail = "@stallowner"

module.exports = async () => {
    await createUsers()
    await createTestData()
    await createStalls()
}

/**
 * Customers
 * (1) - John
 * (2) - Lama
 * (3) - Tom
 * (4) - Dick
 * (5) - Harry
 * (6) - Kenneth
 * (7) - Customer
 */
async function createUsers() {

    //Customers
    let john = await user.createUserWithLastName({
        username: 'John',
        firstName: 'John',
        lastName: 'Tan',
        email: 'john@customer',
        birthday: getRandomDate(),
        password: pw,
        phone: '91234567',
        role: 'Customer',
    })

    let lama = await user.createUserWithLastName({
        username: 'Lama',
        firstName: 'lama',
        lastName: 'Tan',
        email: 'lama@customer',
        birthday: getRandomDate(),
        password: pw,
        phone: '91234567',
        role: 'Customer',
    })

    let tom = await user.createUserWithLastName({
        username: 'Tom',
        firstName: 'tom',
        lastName: 'Tan',
        email: 'tom@customer',
        birthday: getRandomDate(),
        password: pw,
        phone: '91234567',
        role: 'Customer',
    })

    let dick = await user.createUserWithLastName({
        username: 'Dick',
        firstName: 'dick',
        lastName: 'Tan',
        email: 'dick@customer',
        birthday: getRandomDate(),
        password: pw,
        phone: '91234567',
        role: 'Customer',
    })

    let harry = await user.createUserWithLastName({
        username: 'Harry',
        firstName: 'harry',
        lastName: 'lim',
        email: 'harry@customer',
        birthday: getRandomDate(),
        password: pw,
        phone: '91234567',
        role: 'Customer',
    })

    let kenneth = await user.createUserWithLastName({
        username: 'Kenneth',
        firstName: 'kenneth',
        lastName: 'wong',
        email: 'kenneth@customer',
        birthday: getRandomDate(),
        password: pw,
        phone: '91234567',
        role: 'Customer',
    })

    let customer = await user.createUserWithLastName({
        username: 'customer',
        firstName: 'customer',
        email: 'customer@test',
        birthday: new Date('11/2/2018'),
        password: pw,
        phone: '1231231',
        role: 'Customer',
    })

}

/**
 * @typedef {import('./server/utils/stallowner/stall.js').Stall} Stall
 */
/**
 * @typedef {import('./server/utils/main/user').User} User
 */
/**
 * 
 * @param {User} stallOwnerOptions 
 * @param {Stall} stallOptions 
 */
async function createStallOwnerAndStall(stallOwnerOptions, stallOptions, cb){
    let stallOwnerUser = await user.createUser(stallOwnerOptions)
    stallOptions.userId = stallOwnerUser.id
    let nayrbStall = await stall.createStall(stallOptions)
    cb(stallOwnerUser, nayrbStall)
}


/**
 * Stall Owners
 * (8) - Nayrb Western
 * (9) - Nosla Chicken Rice
 * (10) - Eldoon Noodle
 * (11) - Mayushi Japanese
 * (12) - Knird Drink
 */

async function createTestData() {

    /**
     * Cusines
     */
    let westernCusine = await cusine.createCusine('Western')
    let asianCusine = await cusine.createCusine('Asian')
    let japCusine = await cusine.createCusine('Japanese')
    let drinkCusine = await cusine.createCusine('Drinks')

    /**
     * Western (3 Orders)
     * - Chicken Cultlet
     * - Spaghetti
     * - Fish N Chips
     */
    await createStallOwnerAndStall({

        // Stall Owner (Nayrb)
        username: 'Nayrb',
        firstName: 'Nayrb',
        email: 'nayrb@stallowner',
        birthday: new Date('2001/01/19'),
        password: pw,
        phone: '945612378',
        role: 'Stallowner',

    }, {

        // Stall (Nayrb Western)
        stallName: 'Nayrb\'s Western',
        cusineId: westernCusine.id,
        description: 'Most delicious western food at NYP!',

    }, async (stallowner, stall) => {

        //MenuItems
        let chickenCutletItem = await menu_item.createMenuItem({
            itemName: 'Chicken Cutlet',
            itemDesc: 'Juicy Chicken dredge in the seasoned breadcrumbs.',
            price: 4.50,
            active: true,
            stallId: stall.id,
            image: '8ChickenCutlet.jpeg'
        })

        let spaghettiItem = await menu_item.createMenuItem({
            itemName: 'SPAGHETTI BOLOGNESE',
            itemDesc: 'PASTA COOKED WITH MINCE MEAT AND BOLOGNESE SAUCE',
            price: 3.30,
            active: true,
            stallId: stall.id,
            image: '8SpaghettiBolognese.jpeg'
        })

        let fishAndChipItem = await menu_item.createMenuItem({
            itemName: 'Fish and Chips',
            itemDesc: 'Tender ocean fresh fish fillet fried perfectly for that crisp exterior but moist and delicate flesh, served with our signature house tartar sauce, U.S. fries and tangy coleslaw. Our most famous dish will hit the spot, every time…',
            price: 5.20,
            active: true,
            stallId: stall.id,
            image: '8FishAndChips.jpeg'
        })

        /**
         * Create Orders
         */

        // Collection Confirmed
        let order1 = await order_util.createOrder({
            status: 'Collection Confirmed',
            userId: 1,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order1.id,
            menuItemId: chickenCutletItem.id,
            rating: "4",
            comments: "AMAZINGGGGGGGGGGGGGGG",
        })

        let order2 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 2,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order2.id,
            menuItemId: chickenCutletItem.id,
            rating: "2",
            comments: "Tasted raw, not very cooked...",
        })

        let order3 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 3,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order3.id,
            menuItemId: chickenCutletItem.id,
            rating: "3",
            comments: "Very dry.",
        })

    })

    /**
     * Chicken Rice (15 Orders)
     * - Chicken Rice
     * - Duck Rice
     * - Pork Rice
     */
    await createStallOwnerAndStall({
        username: 'Nosla',
        firstName: 'nosla',
        email: 'nosla@stallowner',
        birthday: new Date('2000/09/16'),
        password: pw,
        phone: '91234567',
        role: 'Stallowner',
    }, {
        stallName: 'Nosla\'s Chicken Rice',
        cusineId: asianCusine.id,
        description: 'Enjoy the best Chicken Rice here at Nosla\'s Chicken Rice Stall Today!'
    }, async (stallowner, stall) => {

        //MenuItems
        let chickenItem = await menu_item.createMenuItem({
            itemName: 'Chicken Rice',
            itemDesc: 'A dish of poached chicken and seasoned rice, served with chili sauce and cucumber garnishes',
            price: 2.50,
            active: true,
            stallId: stall.id,
            image: '9ChickenRice.jpeg'
        })
        let duckRiceItem = await menu_item.createMenuItem({
            itemName: 'Duck Rice',
            itemDesc: 'Braised Duck with plain rice',
            price: 3.50,
            active: true,
            stallId: stall.id,
            image: '9DuckRice.jpeg'
        })
        let porkRiceItem = await menu_item.createMenuItem({
            itemName: 'Roasted Pork Rice',
            itemDesc: 'The chunks of lightly crispy, springy, and well-seasoned roast pork with rice',
            price: 3.30,
            active: true,
            stallId: stall.id,
            image: '9RoastedPorkRice.jpeg'
        })
        let deletedRiceItem = await menu_item.createMenuItem({
            itemName: 'Deleted Rice',
            itemDesc: 'Used to test deleted menu items',
            price: 99.99,
            active: false,
            stallId: stall.id
        })

        //Orders (Pending Status)
        let order = await order_util.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 4,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order.id,
            menuItemId: duckRiceItem.id
        })

        let order2 = await order_util.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 5,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            orderId: order2.id,
            menuItemId: chickenItem.id
        })

        let order3 = await order_util.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 6,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 3,
            orderId: order3.id,
            menuItemId: porkRiceItem.id
        })

        let order4 = await order_util.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 7,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order4.id,
            menuItemId: chickenItem.id
        })
        
        let order5 = await order_util.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 1,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            orderId: order5.id,
            menuItemId: duckRiceItem.id
        })

        let order6 = await order_util.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 3,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order5.id,
            menuItemId: porkRiceItem.id
        })

        //Orders (Completed)
        let order7 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 2,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 5,
            rating: "5",
            comments: "The chicken rice was FANTASTIC!!!",
            orderId: order7.id,
            menuItemId: chickenItem.id
        })
        await order_util.createOrderItem({
            quantity: 5,
            rating: "5",
            comments: "The chicken rice was FANTASTIC!!!",
            orderId: order7.id,
            menuItemId: duckRiceItem.id
        })

        let order8 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousMonth,
            userId: 3,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            rating: "5",
            comments: "Very crispy skin",
            orderId: order8.id,
            menuItemId: porkRiceItem.id
        })

        let order9 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousMonth,
            userId: 4,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            rating: "3",
            comments: "Chicken a little dry...",
            orderId: order9.id,
            menuItemId: chickenItem.id
        })

        let order10 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousMonth,
            userId: 5,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            rating: "4",
            comments: "Sauce it really delicious",
            orderId: order10.id,
            menuItemId: duckRiceItem.id
        })

        let order11 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousMonth,
            userId: 6,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            rating: "1",
            comments: "Too dry, disgusting",
            orderId: order11.id,
            menuItemId: deletedRiceItem.id
        })

        let order12 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 7,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 3,
            rating: "5",
            comments: "As delicious as before, keep up the good work!",
            orderId: order12.id,
            menuItemId: porkRiceItem.id
        })

        let order13 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 1,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            rating: "5",
            comments: "Very tender",
            orderId: order13.id,
            menuItemId: duckRiceItem.id
        })

        let order14 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 2,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            rating: "5",
            comments: "Best chicken rice around here!",
            orderId: order14.id,
            menuItemId: chickenItem.id
        })

        let order15 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 3,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            rating: "5",
            comments: "Irresistible!",
            orderId: order15.id,
            menuItemId: duckRiceItem.id
        })

    })

    /**
     * Noodle (3 Orders)
     * - Fish Ball Noodle
     * - Wanton Noodle
     */
    await createStallOwnerAndStall({
        username: 'Eldoon',
        firstName: 'Eldoon',
        email: 'eldoon@stallowner',
        birthday: new Date('1833/12/31'),
        password: pw,
        phone: '91234567',
        role: 'Stallowner',
    },{
        stallName: 'Eldoon\'s Noodle House',
        cusineId: asianCusine.id,
        description: 'Enjoy the best handmade noodles here today!',
    }, async (stallowner, stall) => {
        //MenuItems
        let fishballNoodle = await menu_item.createMenuItem({
            itemName: 'Fishball Noodle',
            itemDesc: 'Served dry or in soup, and with a variety of noodles from mee pok to kway teow.',
            price: 2.50,
            active: true,
            stallId: stall.id,
            image: '10FishballNoodle.jpeg'
        })
        let wantonNoodleItem = await menu_item.createMenuItem({
            itemName: 'Wanton Noodle',
            itemDesc: 'Served in a hot broth, accompanied by leafy greens and shrimp or meat wanton dumplings',
            price: 3,
            active: true,
            stallId: stall.id,
            image: '10WantonNoodle.jpeg'
        })

        //Orders
        let order = await order_util.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 4,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            orderId: order.id,
            menuItemId: fishballNoodle.id
        })
        await order_util.createOrderItem({
            quantity: 2,
            orderId: order.id,
            menuItemId: wantonNoodleItem.id
        })

        let order2 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 5,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order2.id,
            menuItemId: fishballNoodle.id,
            rating: "1",
            comments: "The noodle is too dry not enought taste",
        })

        let order3 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 6,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order3.id,
            menuItemId: fishballNoodle.id,
            rating: "2",
            comments: "Too little ingredients",
        })

        let order4 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 7,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order4.id,
            menuItemId: fishballNoodle.id,
            rating: "1",
            comments: "not Filling",
        })

        let order5 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 1,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order5.id,
            menuItemId: fishballNoodle.id,
            rating: "1",
            comments: "The noodle is too dry not enought taste",
        })

        let order6 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 2,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order6.id,
            menuItemId: wantonNoodleItem.id,
            rating: "3",
            comments: "OKOK Standard could be improved",
        })

        let order7 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 3,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order7.id,
            menuItemId: wantonNoodleItem.id,
            rating: "4",
            comments: "Delicious",
        })

    })
    
    /**
     * Japanese (3 Orders)
     * - Katsu Don
     * - Miso Udon
     */
    await createStallOwnerAndStall({
        username: 'Mayushi',
        firstName: 'mayushi',
        email: 'mayushi@stallowner',
        birthday: new Date('1998/08/21'),
        password: pw,
        phone: '91234567',
        role: 'Stallowner',
    },{
        stallName: 'Tuturu\'s Donburi',
        cusineId: japCusine.id,
        description: 'Tuturu\'s Donburi e yokoso~',
    }, async (stallowner, stall) => {

        //MenuItems
        let katsuItem = await menu_item.createMenuItem({
            itemName: 'Katsu Don',
            itemDesc: 'A bowl of rice topped with a deep-fried pork cutlet, egg, vegetables, and condiments.',
            price: 3.80,
            active: true,
            stallId: stall.id,
            image: '11KatsuDon.jpeg'
        })

        let misoItem = await menu_item.createMenuItem({
            itemName: 'Miso Nikomi Udon',
            itemDesc: 'A hearty and comforting noodle soup where chicken, fish cake, and udon noodles are simmered in a miso-flavored dashi broth.',
            price: 3.80,
            active: true,
            stallId: stall.id,
            image: '11MisoNikomiUdon.jpeg'
        })

        //Orders
        let order = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 3,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order.id,
            menuItemId: katsuItem.id,
            rating: "4",
            comments: "Delicious",
        })

        let order2 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 4,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order2.id,
            menuItemId: katsuItem.id,
            rating: "5",
            comments: "WOWWWWWW",
        })

        let order3 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date(),
            userId: 5,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order3.id,
            menuItemId: misoItem.id,
            rating: "3",
            comments: "Standard Taste",
        })
    })

    /**
     * Drink (6 Orders)
     * - Barley
     * - Ice Lemon Tea
     */
    await createStallOwnerAndStall({
        username: 'Knird',
        firstName: 'Knird',
        email: 'Knird@stallowner',
        birthday: new Date('1833/12/31'),
        password: pw,
        phone: '91234567',
        role: 'Stallowner',
    },{
        stallName: 'Genh Ihz\'s Refereshments',
        cusineId: drinkCusine.id,
        description: 'Thirsty? Here you go...',
    }, async (stallowner, stall) => {
        //MenuItems
        let barleyItem = await menu_item.createMenuItem({
            itemName: 'Barley',
            itemDesc: 'Freshly homemade barley',
            price: 1.50,
            active: true,
            stallId: stall.id,
            image: '12Barley.jpeg'
        })

        let iceLemonTeaItem = await menu_item.createMenuItem({
            itemName: 'Ice Lemon Tea',
            itemDesc: 'Freshly homemade Ice Lemon Tea',
            price: 1.50,
            active: true,
            stallId: stall.id,
            image: '12IceLemonTea.jpeg'
        })

        //Orders
        let order = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 6,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order.id,
            menuItemId: barleyItem.id,
            rating: "5",
            comments: "Really Homemade!",
        })

        let order2 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 7,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 5,
            orderId: order2.id,
            menuItemId: barleyItem.id,
            rating: "3",
            comments: "",
        })

        let order3 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 1,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order3.id,
            menuItemId: barleyItem.id,
            rating: "3",
            comments: "A real thirst quencher",
        })

        let order4 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 2,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order4.id,
            menuItemId: iceLemonTeaItem.id,
            rating: "2",
            comments: "Really Sour!",
        })

        let order5 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 3,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 5,
            orderId: order5.id,
            menuItemId: iceLemonTeaItem.id,
            rating: "4",
            comments: "",
        })

        let order6 = await order_util.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 4,
            stallId: stall.id
        })
        await order_util.createOrderItem({
            quantity: 1,
            orderId: order6.id,
            menuItemId: iceLemonTeaItem.id,
            rating: "1",
            comments: "SOURRRRR",
        })


    })
}

/**
 * Admin
 * (12) - Admin
 */
async function createStalls() {

    await user.createUserWithLastName({
        username: 'administrator',
        firstName: 'lee',
        lastName: 'hsienxiang',
        email: 'admin@orderlah',
        birthday: new Date('2000/09/16'),
        password: pw,
        phone: '91234567',
        role: 'Admin',
    })

}