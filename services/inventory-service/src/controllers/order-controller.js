import { AppError, catchAsync, ok } from '@mualdoo/shared'
import { PurchaseOrder, Item } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import { movementService } from './movement-controller.js'

class OrderService extends BaseService {
    constructor() {
        super(PurchaseOrder)
    }

    async _calculateTotal(order) {
        const item = await Item.findByPk(order.itemId)
        if (!item) throw new AppError('Item not found')

        return item.unitCost * order.quantity
    }

    async create(data) {
        const total = await this._calculateTotal(data)
        data.totalAmount = total
        return this.model.create(data)
    }

    async update(id, data) {
        const instance = await this.model.findByPk(id)
        if (!instance) throw new AppError('Order not found', 404)

        const result = await instance.update(data)

        await movementService.create({
            itemId: instance.itemId,
            type: 'compra',
            quantity: instance.quantity,
            reason: 'Created by system',
            performedBy: instance.performedBy,
        })
        return result
    }
}

export const orderService = new OrderService()

class OrderController extends BaseController {
    constructor() {
        super(orderService)
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

export const orderController = new OrderController()
