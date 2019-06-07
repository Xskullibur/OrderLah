//User
const user = require('./server/utils/main/user')

//Stall
const create_order = require('./server/utils/stallowner/create_order')
const cusine = require('./server/utils/stallowner/cusine')
const stall = require('./server/utils/stallowner/stall')

module.exports = () => {
    
    createCustomers()
    createTestData()
}
    
function createCustomers() {
    //Customers
    user.createUserWithLastName({
        username: 'administrator',
        firstName: 'lee',
        lastName: 'hsienxiang',
        email: 'admin@orderlah',
        birthday: new Date('2000/09/16'),
        password: 'password',
        phone: '91234567',
        role: 'Admin',
    })
    user.createUserWithLastName({
        username: 'Yummy Steak',
        firstName: 'Anna',
        lastName: 'Tan',
        email: 'ys@orderlah',
        birthday: new Date('2000/09/16'),
        password: 'password',
        phone: '91234567',
        role: 'Stallowner',
    })
    user.createUserWithLastName({
        username: 'Tasty Noodle',
        firstName: 'Ben',
        lastName: 'Lim',
        email: 'tn@orderlah',
        birthday: new Date('2000/09/16'),
        password: 'password',
        phone: '91234567',
        role: 'Stallowner',
    })
    //Customers
    user.createUserWithLastName({
        username: 'John',
        firstName: 'John',
        lastName: 'Tan',
        email: 'john@customer',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Customer',
    })
    user.createUserWithLastName({
        username: 'Lama',
        firstName: 'lama',
        lastName: 'Tan',
        email: 'lama@customer',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Customer',
    })
    user.createUserWithLastName({
        username: 'Tom',
        firstName: 'tom',
        lastName: 'Tan',
        email: 'tom@customer',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Customer',
    })
    user.createUserWithLastName({
        username: 'Dick',
        firstName: 'dick',
        lastName: 'Tan',
        email: 'dick@customer',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
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

async function createTestData() {

    const previousDate = new Date()
    previousDate.setDate(previousDate.getDate() - 1)

    //Western (1 Stall Owner, 3 Food Item, 3 Orders)
    let westernCusine = await cusine.createCusine('Western')
    createStallOwnerAndStall({
        username: 'Nayrb',
        firstName: 'Nayrb',
        email: 'nayrb@stallowner',
        birthday: new Date('2001/01/19'),
        password: 'test',
        phone: '945612378',
        role: 'Stallowner',
    }, {
        stallName: 'Nayrb\'s Western',
        cusineId: westernCusine.id,
        description: 'Most delicious western food at NYP!',
    }, async (stallowner, stall) => {
        //MenuItems
        let chickenCutletItem = await create_order.createMenuItem({
            itemName: 'Chicken Cutlet',
            itemDesc: 'Juicy Chicken dredge in the seasoned breadcrumbs.',
            price: 4.50,
            active: true,
            stallId: stall.id
        })
        let spaghettiItem = await create_order.createMenuItem({
            itemName: 'SPAGHETTI BOLOGNESE',
            itemDesc: 'PASTA COOKED WITH MINCE MEAT AND BOLOGNESE SAUCE',
            price: 3.30,
            active: true,
            stallId: stall.id
        })
        let fishAndChipItem = await create_order.createMenuItem({
            itemName: 'Fish and Chips',
            itemDesc: 'Tender ocean fresh fish fillet fried perfectly for that crisp exterior but moist and delicate flesh, served with our signature house tartar sauce, U.S. fries and tangy coleslaw. Our most famous dish will hit the spot, every time…',
            price: 5.20,
            active: true,
            stallId: stall.id
        })
        //Creates orders
        let order1 = await create_order.createOrder({
            status: 'Collection Confirmed',
            userId: 4,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order1.id,
            menuItemId: chickenCutletItem.id,
            rating: "4",
            comments: "AMAZINGGGGGGGGGGGGGGG",
        })

        let order2 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 5,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order2.id,
            menuItemId: chickenCutletItem.id,
            rating: "2",
            comments: "Tasted raw, not very cooked...",
        })
        let order3 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 1,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order3.id,
            menuItemId: chickenCutletItem.id,
            rating: "3",
            comments: "Very dry.",
        })
    })

    //Asian (2 Stalls)
    let asianCusine = await cusine.createCusine('Asian')
    //Chicken Rice (1 Stall Owner, 4 Food Item, 2 Orders)
    createStallOwnerAndStall({
        username: 'Stall Owner',
        firstName: 'nosla',
        email: 'nosla@stallowner',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Stallowner',
    }, {
        stallName: 'Nosla\'s Chicken Rice',
        cusineId: asianCusine.id,
        description: 'Enjoy the best Chicken Rice here at Nosla\'s Chicken Rice Stall Today!'
    }, async (stallowner, stall) => {
        //MenuItems
        let chickenItem = await create_order.createMenuItem({
            itemName: 'Chicken Rice',
            itemDesc: 'A dish of poached chicken and seasoned rice, served with chili sauce and cucumber garnishes',
            price: 2.50,
            active: true,
            stallId: stall.id
        })
        let duckRiceitem = await create_order.createMenuItem({
            itemName: 'Duck Rice',
            itemDesc: 'Braised Duck with plain rice',
            price: 3.50,
            active: true,
            stallId: stall.id
        })
        create_order.createMenuItem({
            itemName: 'Roasted Pork Rice',
            itemDesc: 'The chunks of lightly crispy, springy, and well-seasoned roast pork with rice',
            price: 3.30,
            active: true,
            stallId: stall.id
        })
        create_order.createMenuItem({
            itemName: 'Deleted Rice',
            itemDesc: 'Used to test deleted menu items',
            price: 99.99,
            active: false,
            stallId: stall.id
        })
        let customer = await user.createUserWithLastName({
            username: 'Customer',
            firstName: 'customer',
            email: 'customer@test',
            birthday: new Date('11/2/2018'),
            password: 'test',
            phone: '1231231',
            role: 'Customer',
        })
        //Orders
        let order = await create_order.createOrder({
            status: 'Order Pending',
            orderTiming: previousDate,
            userId: customer.id,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 2,
            orderId: order.id,
            menuItemId: chickenItem.id
        })

        let order2 = await create_order.createOrder({
            status: 'Order Pending',
            orderTiming: previousDate,
            userId: 1,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 2,
            orderId: order2.id,
            menuItemId: chickenItem.id
        })

        let order3 = await create_order.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 2,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 2,
            orderId: order3.id,
            menuItemId: chickenItem.id
        })

        let order4 = await create_order.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 3,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 2,
            orderId: order4.id,
            menuItemId: chickenItem.id
        })
        
        let order5 = await create_order.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 4,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 2,
            orderId: order5.id,
            menuItemId: chickenItem.id
        })

        //Completed Order
        let order6 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: customer.id,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 5,
            rating: "5",
            comments: "The chicken rice was FANTASTIC!!!",
            orderId: order6.id,
            menuItemId: chickenItem.id
        })
        create_order.createOrderItem({
            quantity: 5,
            rating: "5",
            comments: "The chicken rice was FANTASTIC!!!",
            orderId: order6.id,
            menuItemId: duckRiceitem.id
        })

    })

    //Noodle (1 Stall Owner, 2 Food Item, 3 Orders)
    createStallOwnerAndStall({
        username: 'Eldoon',
        firstName: 'Eldoon',
        email: 'eldoon@stallowner',
        birthday: new Date('1833/12/31'),
        password: 'test',
        phone: '91234567',
        role: 'Stallowner',
    },{
        stallName: 'Eldoon\'s Noodle House',
        cusineId: asianCusine.id,
        description: 'Enjoy the best handmade noodles here today!',
    }, async (stallowner, stall) => {
        //MenuItems
        let fishballNoodle = await create_order.createMenuItem({
            itemName: 'Fishball Noodle',
            itemDesc: 'Served dry or in soup, and with a variety of noodles from mee pok to kway teow.',
            price: 2.50,
            active: true,
            stallId: stall.id
        })
        let wantonNoodleItem = await create_order.createMenuItem({
            itemName: 'Wanton Noodle',
            itemDesc: 'Served in a hot broth, accompanied by leafy greens and shrimp or meat wanton dumplings',
            price: 3,
            active: true,
            stallId: stall.id
        })

        //Orders
        let order = await create_order.createOrder({
            status: 'Order Pending',
            orderTiming: new Date,
            userId: 5,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 2,
            orderId: order.id,
            menuItemId: fishballNoodle.id
        })
        create_order.createOrderItem({
            quantity: 2,
            orderId: order.id,
            menuItemId: wantonNoodleItem.id
        })
        let order2 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 5,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order2.id,
            menuItemId: fishballNoodle.id,
            rating: "1",
            comments: "The noodle is too dry not enought taste",
        })
        let order3 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 3,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order3.id,
            menuItemId: fishballNoodle.id,
            rating: "2",
            comments: "Too little ingredients",
        })
        let order4 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 5,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order4.id,
            menuItemId: fishballNoodle.id,
            rating: "1",
            comments: "not Filling",
        })
        let order5 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 5,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order5.id,
            menuItemId: fishballNoodle.id,
            rating: "1",
            comments: "The noodle is too dry not enought taste",
        })

        let order6 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 2,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order6.id,
            menuItemId: wantonNoodleItem.id,
            rating: "3",
            comments: "OKOK Standard could be improved",
        })
        let order7 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 5,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order7.id,
            menuItemId: wantonNoodleItem.id,
            rating: "4",
            comments: "Delicious",
        })

    })

    
    //Japanese (1 Stall Owner, 2 Food Item, 3 Orders)
    let japCusine = await cusine.createCusine('Japanese')
    createStallOwnerAndStall({
        username: 'Mayushi',
        firstName: 'mayushi',
        email: 'mayushi@stallowner',
        birthday: new Date('1998/08/21'),
        password: 'test',
        phone: '91234567',
        role: 'Stallowner',
    },{
        stallName: 'Tuturu\'s Donburi',
        cusineId: japCusine.id,
        description: 'Tuturu\'s Donburi e yokoso~',
    }, async (stallowner, stall) => {
        //MenuItems
        let katsuItem = await create_order.createMenuItem({
            itemName: 'Katsu Don',
            itemDesc: 'A bowl of rice topped with a deep-fried pork cutlet, egg, vegetables, and condiments.',
            price: 3.80,
            active: true,
            stallId: stall.id
        })
        let misoItem = await create_order.createMenuItem({
            itemName: 'Miso Nikomi Udon',
            itemDesc: 'A hearty and comforting noodle soup where chicken, fish cake, and udon noodles are simmered in a miso-flavored dashi broth.',
            price: 3.80,
            active: true,
            stallId: stall.id
        })

        //Orders
        let order = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 2,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order.id,
            menuItemId: katsuItem.id,
            rating: "4",
            comments: "Delicious",
        })

        let order2 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: previousDate,
            userId: 5,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order2.id,
            menuItemId: katsuItem.id,
            rating: "5",
            comments: "WOWWWWWW",
        })

        let order3 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date(),
            userId: 1,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order3.id,
            menuItemId: misoItem.id,
            rating: "3",
            comments: "Standard Taste",
        })
    })

    //Drink (1 Stall Owner, 2 Item, 6 Orders)
    let drinkCusine = await cusine.createCusine('Drinks')
    createStallOwnerAndStall({
        username: 'Knird',
        firstName: 'Knird',
        email: 'Knird@stallowner',
        birthday: new Date('1833/12/31'),
        password: 'test',
        phone: '91234567',
        role: 'Stallowner',
    },{
        stallName: 'Genh Ihz\'s Refereshments',
        cusineId: drinkCusine.id,
        description: 'Thirsty? Here you go...',
    }, async (stallowner, stall) => {
        //MenuItems
        let barleyItem = await create_order.createMenuItem({
            itemName: 'Barley',
            itemDesc: 'Freshly homemade barley',
            price: 1.50,
            active: true,
            stallId: stall.id
        })
        let iceLemonTeaItem = await create_order.createMenuItem({
            itemName: 'Ice Lemon Tea',
            itemDesc: 'Freshly homemade Ice Lemon Tea',
            price: 1.50,
            active: true,
            stallId: stall.id
        })

        //Orders
        let order = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 2,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order.id,
            menuItemId: barleyItem.id,
            rating: "5",
            comments: "Really Homemade!",
        })

        let order2 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 3,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 5,
            orderId: order2.id,
            menuItemId: barleyItem.id,
            rating: "3",
            comments: "",
        })

        let order3 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 1,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order3.id,
            menuItemId: barleyItem.id,
            rating: "3",
            comments: "A real thirst quencher",
        })

        let order4 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 2,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order4.id,
            menuItemId: iceLemonTeaItem.id,
            rating: "2",
            comments: "Really Sour!",
        })

        let order5 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 3,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 5,
            orderId: order5.id,
            menuItemId: iceLemonTeaItem.id,
            rating: "4",
            comments: "",
        })

        let order6 = await create_order.createOrder({
            status: 'Collection Confirmed',
            orderTiming: new Date,
            userId: 1,
            stallId: stall.id
        })
        create_order.createOrderItem({
            quantity: 1,
            orderId: order6.id,
            menuItemId: iceLemonTeaItem.id,
            rating: "1",
            comments: "SOURRRRR",
        })


    })
}