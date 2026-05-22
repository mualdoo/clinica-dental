import { AppError, catchAsync, ok } from '@mualdoo/shared'
import { StockMovement, Item } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'

class MovementService extends BaseService {
    constructor() {
        super(StockMovement)
    }

    async _updateStock(movement) {
        const item = await Item.findByPk(movement.itemId)
        if (!item) throw new AppError('Item not found')

        const oldStock = item.stockCurrent
        const quantity = movement.quantity

        let newStock = null
        if (movement.type === 'compra') newStock = oldStock + quantity
        else if (movement.type === 'consumo') newStock = oldStock - quantity
        else if (movement.type === 'ajuste') newStock = quantity

        if (newStock < 0) throw new AppError('El stock no puede ser negativo')

        await item.update({ stockCurrent: newStock })
    }

    async create(data) {
        await this._updateStock(data)
        return this.model.create(data)
    }
}

export const movementService = new MovementService()

class MovementController extends BaseController {
    constructor() {
        super(movementService)
    }

    create = catchAsync(async (req, res) => {
        const { id } = req.params
        const userId = req.headers['x-user-id']

        const response = await this.service.create({
            itemId: id,
            performedBy: userId,
            ...req.body,
        })
        return ok(res, response, 201)
    })
}

export const movementController = new MovementController()
