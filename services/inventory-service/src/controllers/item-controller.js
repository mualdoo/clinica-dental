import { Item } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import { catchAsync, ok } from '@mualdoo/shared'

class ItemService extends BaseService {
    constructor() {
        super(Item)
    }
}

export const itemService = new ItemService()

class ItemController extends BaseController {
    constructor() {
        super(itemService)
    }

    create = catchAsync(async (req, res) => {
        const { id } = req.params
        const response = await this.service.create({
            supplierId: id,
            ...req.body,
        })
        return ok(res, response, 201)
    })
}

export const itemController = new ItemController()
