import { ok, AppError, catchAsync } from '@mualdoo/shared'

export class BaseService {
    constructor(model) {
        this.model = model
    }

    async findAll({ page = 1, limit = 10, filter = {} } = {}) {
        const offset = (page - 1) * limit
        const result = await this.model.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            where: filter,
        })

        return {
            data: result.rows,
            total: result.count,
            page: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
        }
    }

    async findById(id) {
        const instance = await this.model.findByPk(id)
        if (!instance) throw new AppError('Item not found', 404)
        return instance
    }

    async create(data) {
        return this.model.create(data)
    }

    async update(id, data) {
        const instance = await this.model.findByPk(id)
        if (!instance) throw new AppError('Item not found', 404)
        return instance.update(data)
    }

    async remove(id) {
        const instance = await this.model.findByPk(id)
        if (!instance) throw new AppError('Item not found', 404)
        await instance.destroy()
    }
}

export class BaseController {
    constructor(service) {
        this.service = service
    }

    findAll = catchAsync(async (req, res) => {
        const { page = 1, limit = 10 } = req.query

        const response = await this.service.findAll({ page, limit })
        return ok(res, response)
    })

    findById = catchAsync(async (req, res) => {
        const response = await this.service.findById(req.params.id)
        return ok(res, response)
    })

    create = catchAsync(async (req, res) => {
        const response = await this.service.create(req.body)
        return ok(res, response, 201)
    })

    update = catchAsync(async (req, res) => {
        const response = await this.service.update(req.params.id, req.body)
        return ok(res, response)
    })

    remove = catchAsync(async (req, res) => {
        await this.service.remove(req.params.id)
        return ok(res, 'Item removed')
    })
}
