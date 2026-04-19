import { Patient } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import { ok, catchAsync, publishEvent } from '@mualdoo/shared'
import amqp from 'amqplib'

class PatientService extends BaseService {
    constructor() {
        super(Patient)
    }

    _verifyOwnership(headereUser, patient) {
        if (headereUser.role !== 'patient') return

        const valid = patient.verifyOwnership(
            headereUser.activePatientId,
            headereUser.authUserId
        )

        if (!valid) throw new AppError('Permission denied', 403)
    }

    async findAll() {
        return this.model.findAll({
            attributes: ['id', 'name', 'lastName', 'email', 'phone'],
        })
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
        }

        return this.model.create(data)
    }

    async update(user, id, data) {
        const instance = await this.model.findByPk(id)

        if (!instance) throw new AppError('Item not found', 404)
        this._verifyOwnership(user, instance)

        return instance.update(data)
    }

    async verifyPatient(where) {
        const patient = await this.model.findOne({ where })
        return !!patient
    }
}

export const patientService = new PatientService()

class PatientController extends BaseController {
    constructor() {
        super(patientService)
    }

    _getUserInHeaders(req) {
        const user = {}
        user.authUserId = req.headers['x-user-id']
        user.activePatientId = req.headers['x-active-patient-id']
        user.role = req.headers['x-user-role']
        return user
    }

    findById = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)

        const response = await this.service.findById(user, req.params.id)
        return ok(res, response)
    })

    create = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)

        const patient = await this.service.create(user, req.body)

        await publishEvent(
            amqp,
            'patient_created_exchange',
            process.env.RABBITMQ_URL,
            {
                email: patient.email,
                name: patient.name,
                lastName: patient.lastName,
            }
        )

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

export const patientController = new PatientController()
