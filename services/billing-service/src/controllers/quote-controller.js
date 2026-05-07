import { Quote, QuoteItem, Treatment, Payment } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import { verifyPatient, patientExists } from '../services/patient-service.js'
import { ok, AppError, catchAsync } from '@mualdoo/shared'

class QuoteService extends BaseService {
    constructor() {
        super(Quote)
    }

    async _verifyOwnership(user) {
        if (user.role !== 'patient') return

        const valid = await verifyPatient(user.activePatientId, user.authUserId)
        if (!valid) throw new AppError('Permission denied', 403)
    }

    async findAll(user, { page, limit, filter = {} } = {}) {
        const offset = (page - 1) * limit

        if (user.role === 'patient') {
            filter.patientId = user.activePatientId
        }

        const result = await this.model.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            where: filter,
            include: [
                {
                    model: QuoteItem,
                    as: 'items',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    include: {
                        model: Treatment,
                        as: 'treatment',
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                },
                {
                    model: Payment,
                    as: 'Payments',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
            ],
        })

        return {
            data: result.rows,
            total: result.count,
            page: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
        }
    }

    async findById(user, id) {
        // const instance = await this.model.findByPk(id, {
        print('desde el service ', user, id)
        const instance = await Quote.findByPk(id, {
            include: [
                {
                    model: QuoteItem,
                    as: 'items',
                    attributes: ['id', 'toothNumber', 'discount'],
                    include: {
                        model: Treatment,
                        as: 'treatment',
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                },
                // {
                //     model: Payment,
                //     where: {
                //         status: 'completed'
                //     }
                // }
            ],
        })

        if (!instance) throw new AppError('Item not found', 404)
        await this._verifyOwnership(user)

        return instance
    }

    async create(data) {
        const { patientId } = data

        const valid = await patientExists(patientId)
        if (!valid) throw new AppError('Patient not found', 404)

        return this.model.create(data)
    }

    async update(id, data) {
        const { patientId = null } = data
        const instance = await this.model.findByPk(id)
        if (!instance) throw new AppError('Item not found', 404)

        if (patientId) {
            const valid = await patientExists(patientId)
            if (!valid) throw new AppError('Patient not found', 404)
        }

        return instance.update(data)
    }
}

export const quoteService = new QuoteService()

class QuoteController extends BaseController {
    constructor() {
        super(quoteService)
    }

    _getUserInHeaders(req) {
        const user = {}
        user.authUserId = req.headers['x-user-id']
        user.activePatientId = req.headers['x-active-patient-id']
        user.role = req.headers['x-user-role']
        return user
    }

    findAll = catchAsync(async (req, res) => {
        const { page = 1, limit = 10 } = req.query
        const user = this._getUserInHeaders(req)

        const response = await this.service.findAll(user, { page, limit })
        return ok(res, response)
    })

    findByPatient = catchAsync(async (req, res) => {
        const { page = 1, limit = 10 } = req.query
        const { patientId } = req.params
        const user = this._getUserInHeaders(req)

        const response = await this.service.findAll(user, {
            page,
            limit,
            filter: { patientId },
        })
        return ok(res, response)
    })
}

export const quoteController = new QuoteController()
