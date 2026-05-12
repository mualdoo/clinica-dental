import sequelize from '../config/database.js'
import Supplier from './supplier.js'
import Item from './item.js'
import StockMovement from './stock-movement.js'
import PurchaseOrder from './purchase-order.js'

Supplier.hasMany(Item, { foreignKey: { name: 'supplierId', allowNull: false } })
Item.belongsTo(Supplier, {
    foreignKey: { name: 'supplierId', allowNull: false },
})

Item.hasMany(StockMovement, {
    foreignKey: { name: 'itemId', allowNull: false },
})
StockMovement.belongsTo(Item, {
    foreignKey: { name: 'itemId', allowNull: false },
})

Item.hasMany(PurchaseOrder, {
    foreignKey: { name: 'itemId', allowNull: false },
})
PurchaseOrder.belongsTo(Item, {
    foreignKey: { name: 'itemId', allowNull: false },
})

const syncDatabase = async () => {
    await sequelize.sync({ alter: true })
}

export { sequelize, syncDatabase, Supplier, Item, StockMovement, PurchaseOrder }
