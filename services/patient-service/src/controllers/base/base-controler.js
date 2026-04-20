import { Patient } from '../../models/index.js'
import { ok, catchAsync } from '@mualdoo/shared'

export class BaseService {
    constructor(model) {
        this.model = model
    }

    async _verifyOwnership(headerUser) {
        if (headerUser.role !== 'patient') return

        const valid = await Patient.findOne({
            where: {
                authUserId: headerUser.authUserId,
                id: headerUser.activePatientId,
            },
        })

        if (!valid) throw new AppError('Permission denied', 403)
    }

    async findAll({ page, limit, filter = {} } = {}) {
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
            pate: parseInt(page),
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

    async findByPatient(user, { page, limit, filter = {} } = {}) {
        console.log('primera')
        await this._verifyOwnership(user)
        console.log('segunda')

        filter.patientId = user.activePatientId
        console.log('segunda')
        return this.findAll({ page, limit, filter })
    }
}

export class BaseController {
    constructor(service) {
        this.service = service
    }

    _getUserInHeaders(req) {
        const user = {}
        user.authUserId = req.headers['x-user-id']
        user.activePatientId = req.headers['x-active-patient-id']
        user.role = req.headers['x-user-role']

        console.log(user.activePatientId)

        return user
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
        const { id } = req.params
        const response = await this.service.create({
            ...req.body,
            patientId: id,
        })
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

    findByPatient = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)
        const { page = 1, limit = 10 } = req.query

        const response = await this.service.findByPatient(user)
        return ok(res, response)
    })
}
