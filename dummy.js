const globalHandle = require('./server/libs/global/global')

const User  = globalHandle.get('user')
const Stall  = globalHandle.get('stall')
const Order  = globalHandle.get('order')
const OrderItem  = globalHandle.get('orderItem')
const MenuItem  = globalHandle.get('menuItem')

module.exports = () => {

    //Create test user
    User.create({
        username: 'John',
        firstName: 'john',
        email: 'Hancock@test',
        birthday: new Date('11/2/2018'),
        password: 'test',
        phone: '1231231',
        role: 'Customer',
    }).then(john => {
        console.log("John's auto-generated ID:", john.id);
    }).catch(err => console.error(err))

    //Create Stall and Owner
    User.create({
        username: 'Nosla',
        firstName: 'nosla',
        email: 'nosla@chickenrice',
        birthday: new Date('2000/09/16'),
        password: 'tuturu~',
        phone: '91234567',
        role: 'Admin',

    }).then(stallOwner => {

        console.info('\nNosla (Stall Owner):', stallOwner.dataValues);

        Stall.create({
            stallName: 'Nosla\'s Chicken Rice',
            cusine: 'Asian',
            description: 'Enjoy the best Chicken Rice here at Nosla\'s Chicken Rice Stall Today!',
            userId: stallOwner.id,
        }).then(stall => {
            console.info('\nNosla\'s Chicken Rice Stall:', stall.dataValues);
        }).catch(err => console.error(err))

    }).catch(err => console.error(err))

}