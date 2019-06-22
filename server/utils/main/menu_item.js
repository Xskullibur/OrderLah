//Global
const globalHandle = require('../../libs/global/global')

//Get models
const MenuItem = globalHandle.get('menuItem')
const Stall = globalHandle.get('stall')

const Op = require('sequelize').Sequelize.Op

/**
 * MenuItem
 * @typedef {Object} MenuItem
 * @param {string} itemName - name of the menu item
 * @param {string} itemDesc - menu item description
 * @param {number} price - price of the menu item
 * @param {number} stallId - stall which owns or created the menu item
 * @param {boolean} active - wheather the menu item can be still ordered (default true)
 */

module.exports = {
    
    /**
     * Create a new menu item for a stall inside database
     * @param {MenuItem} menuItem - to be created inside database
     * @return {Promise} 
     */
    createMenuItem: function({itemName, itemDesc, price, stallId, active = true}){
        return MenuItem.create({
            itemName: itemName,
            itemDesc: itemDesc,
            price: price,
            active: active,
            stallId: stallId
        })
    },
    /**
     * Get all menu item from database
     * @param {boolean} active - if return active menu items as well
     * @return {Promise} 
     */
    getAllMenuItem: function(active=false){
        return MenuItem.findAll({where: {[Op.or]: [
            {active: !active},{active: true}
        ]}})
    },
    /**
     * Get all menu item by cusine id
     * @param {number} cusineId 
     * @param {boolean} active - if return active menu items as well
     * @return {Promise}
     */
    getMenuItemByCusine: function(cusineId, active=false){
        return Stall.findAll({
            include: [{model: MenuItem, required: true, as: 'menuItems'
                
            }],
            where: {
                cusineId,
                [Op.or]: [
                    {active: !active},{active: true}
                ]
            }
        }).map((a) => a.menuItems).reduce((a, b) => a.concat(b))
    },
    /**
     * Find menu item by id
     * @param {number} id - id of the menu item
     * @return {Promise}
     */
    getMenuItemByID: function(id){
        return MenuItem.findByPk(id)
    },
    /**
     * Find menu items by item name
     * @param {boolean} active - if return active menu items as well
     */
    getMenuItemByName: function(name, active=false){
        return MenuItem.findAll({
            where: {
                itemName: { [Op.like]: '%' + name + '%'},
                [Op.or]: [
                    {active: !active},{active: true}
                ]
            }
        })
    }
}