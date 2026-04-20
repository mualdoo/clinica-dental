import { Patient } from '../models/index.js'
import { ok, catchAsync, publishEvent } from '@mualdoo/shared'
import amqp from 'amqplib'

class PatientService {
    constructor(model) {
        this.model = model
    }

    _verifyOwnership(headerUser, patient) {
        if (headerUser.role !== 'patient') return

        const valid = patient.verifyOwnership(
            headerUser.activePatientId,
            headerUser.authUserId
        )

        if (!valid) throw new AppError('Permission denied', 403)
    }

    async findAll({ page, limit, filter = {} } = {}) {
        const offset = (page - 1) * limit
        const result = await this.model.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: [
                'id',
                'authUserId',
                'name',
                'lastName',
                'email',
                'phone',
            ],
            where: filter,
        })

        return {
            data: result.rows,
            total: result.count,
            pate: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
        }
    }

    async findById(user, id) {
        const instance = await this.model.findByPk(id)

        if (!instance) throw new AppError('Item not found', 404)
        this._verifyOwnership(user, instance)

        return instance
    }

    async create(user, data) {
        if (user.role === 'patient') {
            data.authUserId = user.authUserId
        } else {
            const id = crypto.randomUUID()
            data.authUserId = id
            await publishEvent(
                amqp,
                'patient_created_exchange',
                process.env.RABBITMQ_URL,
                {
                    id,
                    email: data.email,
                    name: data.name,
                    lastName: data.lastName,
                }
            )
        }

        return this.model.create(data)
    }

    async update(user, id, data) {
        const instance = await this.model.findByPk(id)

        if (!instance) throw new AppError('Item not found', 404)
        this._verifyOwnership(user, instance)

        return instance.update(data)
    }

    async remove(id) {
        const instance = await this.model.findByPk(id)
        if (!instance) throw new AppError('Item not found', 404)
        await instance.destroy()
    }

    async verifyPatient(where) {
        const patient = await this.model.findOne({ where })
        return !!patient
    }
}

export const patientService = new PatientService(Patient)

class PatientController {
    constructor(service) {
        this.service = service
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

        const response = await this.service.findAll({ page, limit })
        return ok(res, response)
    })

    findById = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)

        const response = await this.service.findById(user, req.params.id)
        return ok(res, response)
    })

    create = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)

        const patient = await this.service.create(user, req.body)

        return ok(res, patient, 201)
    })

    update = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)

        const response = await this.service.update(
            user,
            req.params.id,
            req.body
        )
        return ok(res, response)
    })

    remove = catchAsync(async (req, res) => {
        await this.service.remove(req.params.id)
        return ok(res, 'Item removed')
    })

    verifyPatient = catchAsync(async (req, res) => {
        const { patientId, authUserId } = req.query

        const valid = await this.service.verifyPatient({
            id: patientId,
            authUserId,
        })

        return ok(res, valid)
    })

    patientExists = catchAsync(async (req, res) => {
        const { patientId } = req.query

        const exists = await this.service.verifyPatient({ patientId })

        return ok(res, exists)
    })
}

export const patientController = new PatientController(patientService)
