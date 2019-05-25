const globalHandle = require('./server/libs/global/global')

const User  = globalHandle.get('user')
const Stall  = globalHandle.get('stall')
const Order  = globalHandle.get('order')
const OrderItem  = globalHandle.get('orderItem')
const MenuItem  = globalHandle.get('menuItem')

module.exports = () => {
    
    //Customers
    User.create({
        username: 'John',
        firstName: 'John',
        email: 'john@customer',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Customer',
    })
    
    User.create({
        username: 'Lama',
        firstName: 'lama',
        email: 'lama@customer',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Customer',
    })
    
    User.create({
        username: 'Tom',
        firstName: 'tom',
        email: 'tom@customer',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Customer',
    })
    
    User.create({
        username: 'Dick',
        firstName: 'dick',
        email: 'dick@customer',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Customer',
    })
    
    //*****     Stall Owner     *****/
    //Chicken Rice (1 Stall Owner, 4 Food Item, 2 Orders)
    User.create({
        username: 'Stall Owner',
        firstName: 'nosla',
        email: 'nosla@stallowner',
        birthday: new Date('2000/09/16'),
        password: 'test',
        phone: '91234567',
        role: 'Admin',
    }).then(stallOwner => {
        Stall.create({
            stallName: 'Nosla\'s Chicken Rice',
            cusine: 'Asian',
            description: 'Enjoy the best Chicken Rice here at Nosla\'s Chicken Rice Stall Today!',
            userId: stallOwner.id,
        }).then(stall => {
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
                    Order.create({
                        status: 'Order Pending',
                        orderTiming: new Date('2000-09-16 21:05:00'),
                        userId: 1,
                        stallId: stall.id
                    }).then(order => {
                        OrderItem.create({
                            quantity: 2,
                            orderId: order.id,
                            menuItemId: item.id
                        }).then(() => {
                            OrderItem.create({
                                quantity: 1,
                                orderId: order.id,
                                menuItemId: item.id + 1
                            })
                        })
                    })

                    Order.create({
                        status: 'Order Pending',
                        orderTiming: new Date('2000-09-16 21:06:00'),
                        userId: 2,
                        stallId: stall.id
                    }).then(order => {
                        OrderItem.create({
                            quantity: 2,
                            orderId: order.id,
                            menuItemId: item.id
                        })
                    })

                    Order.create({
                        status: 'Order Pending',
                        orderTiming: new Date('2000-09-16 21:07:00'),
                        userId: customer.id,
                        stallId: stall.id
                    }).then(order => {
                        OrderItem.create({
                            quantity: 2,
                            orderId: order.id,
                            menuItemId: item.id
                        })
                    })

                    Order.create({
                        status: 'Order Pending',
                        orderTiming: new Date('2000-09-16 21:08:00'),
                        userId: customer.id,
                        stallId: stall.id
                    }).then(order => {
                        OrderItem.create({
                            quantity: 2,
                            orderId: order.id,
                            menuItemId: item.id
                        })
                    })

                    Order.create({
                        status: 'Order Pending',
                        orderTiming: new Date('2000-09-16 21:09:00'),
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
                })
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
        })
    }).catch(err => console.error("Chicken Rice: \n" + err))

    //Western (1 Stall Owner, 3 Food Item, 3 Orders)
    User.create({
        username: 'Nayrb',
        firstName: 'Nayrb',
        email: 'nayrb@stallowner',
        birthday: new Date('2001/01/19'),
        password: 'test',
        phone: '945612378',
        role: 'Admin',
    }).then(stallOwner => {
        Stall.create({
            stallName: 'Nayrb\'s Western',
            cusine: 'Western',
            description: 'Most delicious western food at NYP!',
            userId: stallOwner.id,
        }).then(stall => {
            MenuItem.create({
                itemName: 'Chicken Cutlet',
                itemDesc: 'Juicy Chicken dredge in the seasoned breadcrumbs.',
                price: 4.50,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 4,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "4",
                        comments: "AMAZINGGGGGGGGGGGGGGG",
                    })
                })
            })

            MenuItem.create({
                itemName: 'SPAGHETTI BOLOGNESE',
                itemDesc: 'PASTA COOKED WITH MINCE MEAT AND BOLOGNESE SAUCE',
                price: 3.30,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 5,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "2",
                        comments: "Tasted raw, not very cooked...",
                    })
                })
            })

            MenuItem.create({
                itemName: 'Fish and Chips',
                itemDesc: 'Tender ocean fresh fish fillet fried perfectly for that crisp exterior but moist and delicate flesh, served with our signature house tartar sauce, U.S. fries and tangy coleslaw. Our most famous dish will hit the spot, every time…',
                price: 5.20,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 1,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "3",
                        comments: "Very dry.",
                    })
                })
            })
        })
    }).catch(err => console.error("Western: \n" + err))
    
    
    //Japanese (1 Stall Owner, 2 Food Item, 3 Orders)
    User.create({
        username: 'Mayushi',
        firstName: 'mayushi',
        email: 'mayushi@stallowner',
        birthday: new Date('1998/08/21'),
        password: 'test',
        phone: '91234567',
        role: 'Admin',
    }).then(stallOwner =>{
        //Japanese
        Stall.create({
            stallName: 'Tuturu\'s Donburi',
            cusine: 'Japanese',
            description: 'Tuturu\'s Donburi e yokoso~',
            userId: stallOwner.id,
        }).then(stall => {
            MenuItem.create({
                itemName: 'Katsu Don',
                itemDesc: 'A bowl of rice topped with a deep-fried pork cutlet, egg, vegetables, and condiments.',
                price: 3.80,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 2,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "4",
                        comments: "Delicious",
                    })
                })

                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 5,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "5",
                        comments: "WOWWWWWW",
                    })
                })
            })

            MenuItem.create({
                itemName: 'Miso Nikomi Udon',
                itemDesc: 'A hearty and comforting noodle soup where chicken, fish cake, and udon noodles are simmered in a miso-flavored dashi broth.',
                price: 3.80,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 1,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "3",
                        comments: "Standard Taste",
                    })
                })
            })
        })
    }).catch(err => console.error("Japanese: \n" + err))
        
    //Noodle (1 Stall Owner, 2 Food Item, 3 Orders)
    User.create({
        username: 'Eldoon',
        firstName: 'Eldoon',
        email: 'eldoon@stallowner',
        birthday: new Date('1833/12/31'),
        password: 'test',
        phone: '91234567',
        role: 'Admin',
    }).then(stallOwner => {
        Stall.create({
            stallName: 'Eldoon\'s Noodle House',
            cusine: 'Asian',
            description: 'Enjoy the best handmade noodles here today!',
            userId: stallOwner.id,
        }).then(stall => {
            MenuItem.create({
                itemName: 'Fishball Noodle',
                itemDesc: 'Served dry or in soup, and with a variety of noodles from mee pok to kway teow.',
                price: 2.50,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 5,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "1",
                        comments: "The noodle is too dry not enought taste",
                    })
                })

                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 3,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "2",
                        comments: "Too little ingredients",
                    })
                })

                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 5,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "1",
                        comments: "not Filling",
                    })
                })
            })

            MenuItem.create({
                itemName: 'Wanton Noodle',
                itemDesc: 'Served in a hot broth, accompanied by leafy greens and shrimp or meat wanton dumplings',
                price: 3,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 2,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "3",
                        comments: "OKOK Standard could be improved",
                    })
                })

                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 5,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "4",
                        comments: "Delicious",
                    })
                })
            })
        })
    }).catch(err => console.error("Noodle: \n" + err))
    
    //Drink (1 Stall Owner, 2 Item, 6 Orders)
    User.create({
        username: 'Knird',
        firstName: 'Knird',
        email: 'Knird@stallowner',
        birthday: new Date('1833/12/31'),
        password: 'test',
        phone: '91234567',
        role: 'Admin',
    }).then(stallOwner => {
        Stall.create({
            stallName: 'Genh Ihz\'s Refereshments',
            cusine: 'Mixed',
            description: 'Thirsty? Here you go...',
            userId: stallOwner.id,
        }).then(stall => {
            MenuItem.create({
                itemName: 'Barley',
                itemDesc: 'Freshly homemade barley',
                price: 1.50,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 2,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "5",
                        comments: "Really Homemade!",
                    })
                })

                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 3,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 5,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "3",
                        comments: "",
                    })
                })

                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 1,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "3",
                        comments: "A real thirst quencher",
                    })
                })
            })

            MenuItem.create({
                itemName: 'Ice Lemon Tea',
                itemDesc: 'Freshly homemade Ice Lemon Tea',
                price: 1.50,
                active: true,
                stallId: stall.id
            }).then(item => {
                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 2,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "2",
                        comments: "Really Sour!",
                    })
                })

                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 3,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 5,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "4",
                        comments: "",
                    })
                })

                Order.create({
                    status: 'Collection Confirmed',
                    orderTiming: new Date,
                    userId: 1,
                    stallId: stall.id
                }).then(order => {
                    OrderItem.create({
                        quantity: 1,
                        orderId: order.id,
                        menuItemId: item.id,
                        rating: "1",
                        comments: "SOURRRRR",
                    })
                })
            })
        })
    }).catch(err => console.error("Drink: \n" + err))
}