module.exports = async function getRatingsMatrix(db, MenuItem, User) {
        let rating_matrix = [];

        let menuArray = [];
        let promise = new Promise(async (resolve, reject) => {
            let items = await MenuItem.findAll({attribute: 'id'})
            items.forEach(item => {
                menuArray.push(item.id)
            });

            let users = await User.findAll()

            for(let user of users){
                rating_matrix[user.id - 1] = []//To to -1
                let userRating = []

                for(let menuItemId of menuArray){
                    //Get the rating of the menuItem provided by user
                    let [result, metadata] = await db.query(`
                        SELECT orderlah_db.orders.userId, orderlah_db.orderItems.orderId, orderlah_db.orderItems.menuItemId, orderlah_db.menuItems.itemName, orderlah_db.orderItems.rating
                        FROM orderlah_db.orderItems
                        INNER JOIN orderlah_db.orders ON orderlah_db.orderItems.orderId = orderlah_db.orders.id
                        INNER JOIN orderlah_db.menuItems ON orderlah_db.orderItems.menuItemId = orderlah_db.menuItems.id
                        WHERE orderlah_db.orders.status = 'Collection Confirmed'
                        AND orderlah_db.orders.userId = ${user.id}
                        AND orderItems.menuItemId = ${menuItemId}
                        ORDER BY orderlah_db.orders.userId, orderlah_db.orderItems.menuItemId
                    `)
                    let rating = 0;
                    if (result[0] != undefined) {
                        rating = parseInt(result[0].rating)
                    }

                    userRating.push(rating)
                    
                }
                rating_matrix[user.id - 1] = userRating
                
            }
            resolve(rating_matrix)
        })

        return promise
        
}
