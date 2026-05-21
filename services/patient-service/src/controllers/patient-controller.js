import { Patient } from '../models/index.js'
import { ok, catchAsync, publishEvent, AppError } from '@mualdoo/shared'
import amqp from 'amqplib'
import { Op, where } from 'sequelize'
import getUser from '../services/auth-service.js'

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

    async _verifyUserAccount(userId) {
        const user = await getUser(userId)
        if (!user || user.role !== 'patient')
            throw new AppError('Permission denied', 403)
        return user
    }

    async findAll(user, { page, limit, filter = {} } = {}) {
        const offset = (page - 1) * limit

        if (user.role === 'patient') {
            filter.authUserId = user.authUserId
        }

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

    async findAllByKey({ key, page, limit } = {}) {
        const term = `%${key.trim()}%`

        const result = await Patient.findAndCountAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: term } },
                    { lastName: { [Op.iLike]: term } },
                    { email: { [Op.iLike]: term } },
                    { phone: { [Op.like]: term } },
                ],
            },
            limit,
            order: [
                ['lastName', 'ASC'],
                ['name', 'ASC'],
            ],
            attributes: [
                'id',
                'authUserId',
                'name',
                'lastName',
                'email',
                'phone',
                'gender',
                'bloodType',
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
        const instance = await this.model.findByPk(id)

        if (!instance) throw new AppError('Item not found', 404)
        this._verifyOwnership(user, instance)

        return instance
    }

    async create(user, data) {
        if (user.role === 'patient') {
            const patientUser = await this._verifyUserAccount(user.authUserId)

            data.authUserId = patientUser.id
            data.email = patientUser.email
        } else {
            // Verificar si hay otra cuenta de paciente asociada al mismo correo
            const patients = await Patient.findAndCountAll({
                where: { email: data.email },
            })

            let id = crypto.randomUUID()
            if (patients.count >= 3) {
                throw new AppError(
                    'Accounts can only have 3 patients associated'
                )
            } else if (patients.count > 0) {
                id = patients.rows[0].authUserId
            }

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
                    role: 'patient',
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
        return patient
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
        const user = this._getUserInHeaders(req)

        const response = await this.service.findAll(user, { page, limit })
        return ok(res, response)
    })

    findAllByKey = catchAsync(async (req, res) => {
        const { page = 1, limit = 10, key } = req.query

        const response = await this.service.findAllByKey({ key, page, limit })
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

        return ok(res, !!valid)
    })

    patientExists = catchAsync(async (req, res) => {
        const { patientId } = req.query

        const patient = await this.service.verifyPatient({ id: patientId })

        return ok(res, patient)
    })
}

export const patientController = new PatientController(patientService)
