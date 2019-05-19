const globalHandle = require('./server/libs/global/global')

const User  = globalHandle.get('user')
const Stall  = globalHandle.get('stall')
const Order  = globalHandle.get('order')
const OrderItem  = globalHandle.get('orderItem')
const MenuItem  = globalHandle.get('menuItem')

module.exports = () => {

    //Create Stall and Owner
    User.create({
        username: 'Stall Owner',
        firstName: 'nosla',
        email: 'nosla@stallowner',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Admin',

    }).then(stallOwner => {

        console.info('\nNosla (Stall Owner):', stallOwner.dataValues);

        //Chicken Rice
        Stall.create({
            stallName: 'Nosla\'s Chicken Rice',
            cusine: 'Asian',
            description: 'Enjoy the best Chicken Rice here at Nosla\'s Chicken Rice Stall Today!',
            userId: stallOwner.id,
        }).then(stall => {
            console.info('\nNosla\'s Chicken Rice Stall:', stall.dataValues);
            MenuItem.create({
                itemName: 'Chicken Rice',
                itemDesc: 'A dish of poached chicken and seasoned rice, served with chili sauce and cucumber garnishes',
                price: 2.50,
                active: true,
                stallId: stall.id
            }).then(item => {
                User.create({
                    username: 'Customer',
                    firstName: 'customer',
                    email: 'customer@test',
                    birthday: new Date('11/2/2018'),
                    password: 'test',
                    phone: '1231231',
                    role: 'Customer',
                }).then(customer => {
                    console.log("John's auto-generated ID:", customer.id);

                    //Pending Order
                    Order.create({
                        status: 'Order Pending',
                        orderTiming: new Date,
                        userId: customer.id,
                        stallId: stall.id
                    }).then(order => {
                        OrderItem.create({
                            quantity: 2,
                            orderId: order.id,
                            menuItemId: item.id
                        })
                    })

                    //Completed Order
                    Order.create({
                        status: 'Collection Confirmed',
                        orderTiming: new Date,
                        userId: customer.id,
                        stallId: stall.id
                    }).then(order => {
                        OrderItem.create({
                            quantity: 5,
                            rating: "5",
                            comments: "The chicken rice was FANTASTIC!!!",
                            orderId: order.id,
                            menuItemId: item.id
                        })
                    })
                }).catch(err => console.error(err))
            })

            MenuItem.create({
                itemName: 'Duck Rice',
                itemDesc: 'Braised Duck with plain rice',
                price: 3.50,
                active: true,
                stallId: stall.id
            })

            MenuItem.create({
                itemName: 'Roasted Pork Rice',
                itemDesc: 'The chunks of lightly crispy, springy, and well-seasoned roast pork with rice',
                price: 3.30,
                active: true,
                stallId: stall.id
            })

            MenuItem.create({
                itemName: 'Deleted Rice',
                itemDesc: 'Used to test deleted menu items',
                price: 99.99,
                active: false,
                stallId: stall.id
            })
        }).catch(err => console.error(err))

        //Western
        Stall.create({
            stallName: 'Nayrb\'s Western',
            cusine: 'Western',
            description: 'Most delicious western food at NYP!',
            userId: stallOwner.id,
        }).then(stall => {
            console.info('\nNayrb\'s Western:', stall.dataValues);
        }).catch(err => console.error(err))

        //Japanese
        Stall.create({
            stallName: 'Tuturu\'s Donburi',
            cusine: 'Japanese',
            description: 'Tuturu\'s Donburi e yokoso~',
            userId: stallOwner.id,
        }).then(stall => {
            console.info('\nTuturu\'s Donburi:', stall.dataValues);
        }).catch(err => console.error(err))

        //Noodle Stall
        Stall.create({
            stallName: 'Eldoon\'s Noodle House',
            cusine: 'Asian',
            description: 'Enjoy the best handmade noodles here today!',
            userId: stallOwner.id,
        }).then(stall => {
            console.info('\nEldoon\'s Noodle House:', stall.dataValues);
        }).catch(err => console.error(err))

        //Drink
        Stall.create({
            stallName: 'Genh Ihz\'s Refereshments',
            cusine: 'Mixed',
            description: 'Thirsty? Here you go...',
            userId: stallOwner.id,
        }).then(stall => {
            console.info('\nHenh Ihz\'s Refreshments', stall.dataValues);
        }).catch(err => console.error(err))

    }).catch(err => console.error(err))

}