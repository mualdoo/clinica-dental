import { Op } from 'sequelize'
import { ok, catchAsync, AppError, publishEvent } from '@mualdoo/shared'
import { Appointment, Cubicle } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import fetchUser from '../services/auth-service.js'
import { verifyPatient, patientExists } from '../services/patient-service.js'
import amqp from 'amqplib'

const buildAppointmentFilter = (query) => {
    const { cubicleId, patientId, dentistId, startTime, endTime, status } =
        query
    const where = {}

    if (cubicleId) where.cubicleId = cubicleId
    if (patientId) where.patientId = patientId
    if (dentistId) where.dentistId = dentistId
    if (status) where.status = status

    if (startTime || endTime) {
        where.startTime = {}

        if (startTime) where.startTime[Op.gte] = new Date(startTime)
        if (endTime) where.startTime[Op.lte] = new Date(endTime)
    }
    return where
}

const validateDentist = async (id) => {
    const dentist = await fetchUser(id)
    if (!dentist || dentist.role !== 'dentist') {
        console.log('app error, dentist not found')

        throw new AppError('Dentist not found')
    }
    return dentist
}

const validateSchedule = async (data, id = null) => {
    const { cubicleId, patientId, dentistId, startTime, endTime } = data

    const conditions = []
    if (cubicleId) conditions.push({ cubicleId })
    if (patientId) conditions.push({ patientId })
    if (dentistId) conditions.push({ dentistId })

    if (conditions.length === 0) return

    const whereClause = {
        status: 'scheduled',
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime },
        [Op.or]: conditions,
    }
    if (id) whereClause.id = { [Op.ne]: id }

    const collision = await Appointment.findOne({ where: whereClause })

    if (collision) {
        if (cubicleId && collision.cubicleId === cubicleId)
            throw new AppError('Cubicle occupied')
        if (patientId && collision.patientId === patientId)
            throw new AppError('Patient occupied')
        if (dentistId && collision.dentistId === dentistId)
            throw new AppError('Dentist occupied')
    }
}

class AppointmentService extends BaseService {
    constructor() {
        super(Appointment)
    }

    async _verifyOwnership(user) {
        if (user.role !== 'patient') return

        const valid = await verifyPatient(user.activePatientId, user.authUserId)
        if (!valid) throw new AppError('Permission denied', 403)
    }

    async _patientExists(patientId) {
        const patient = await patientExists(patientId)
        if (!patient) throw new AppError('Patient not found', 404)
        return patient
    }

    async findAll(user, { page, limit, filter = {} } = {}) {
        const offset = (page - 1) * limit

        if (user.role === 'patient') {
            filter.patientId = user.activePatientId
        }

        const result = await this.model.findAndCountAll({
            order: [['startTime', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            where: filter,
            include: Cubicle,
        })

        return {
            data: result.rows,
            total: result.count,
            page: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
        }
    }

    async findById(user, id) {
        const instance = await this.model.findByPk(id, {
            include: Cubicle,
        })

        if (!instance) throw new AppError('Item not found', 404)
        await this._verifyOwnership(user)

        return instance
    }

    async create(user, data) {
        if (user.role === 'patient') {
            data.patientId = user.activePatientId
        }

        const dentist = await validateDentist(data.dentistId)
        const patient = await this._patientExists(data.patientId)
        await validateSchedule(data)

        data.patientName = `${patient.name} ${patient.lastName}`
        data.dentistName = `${dentist.name} ${dentist.lastName}`

        return this.model.create(data)
    }

    async update(user, id, data) {
        const instance = await this.model.findByPk(id)

        if (!instance) throw new AppError('Item not found', 404)

        await this._verifyOwnership(user)
        if (data.dentistId) await validateDentist(data.dentistId)
        await validateSchedule(data, id)

        return instance.update(data)
    }

    async remove(user, id) {
        const instance = await this.model.findByPk(id)

        if (!instance) throw new AppError('Item not found', 404)
        await this._verifyOwnership(user)

        await instance.destroy()
    }

    async internalFindAll({ page, limit, filter = {} } = {}) {
        const offset = (page - 1) * limit

        const result = await this.model.findAndCountAll({
            order: [['startTime', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            where: filter,
            include: Cubicle,
        })

        return {
            data: result.rows,
            total: result.count,
            page: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
        }
    }
}

export const appointmentService = new AppointmentService()

class AppointmentController extends BaseController {
    constructor() {
        super(appointmentService)
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
        const filter = buildAppointmentFilter(req.query)
        const user = this._getUserInHeaders(req)

        const response = await this.service.findAll(user, {
            page,
            limit,
            filter,
        })
        return ok(res, response)
    })

    findById = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)

        const response = await this.service.findById(user, req.params.id)
        return ok(res, response)
    })

    create = catchAsync(async (req, res) => {
        const { patientId, dentistId } = req.body

        const user = this._getUserInHeaders(req)

        const appointment = await this.service.create(user, req.body)

        await publishEvent(
            amqp,
            'appointment_created_exchange',
            process.env.RABBITMQ_URL,
            {
                email: user.email,
                fullName: user.fullName,
                appointmentDate: appointment.startTime,
            }
        )

        return ok(res, appointment, 201)
    })

    update = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)

        const appointment = await this.service.update(
            user,
            req.params.id,
            req.body
        )
        return ok(res, appointment)
    })

    remove = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)

        await this.service.remove(user, req.params.id)
        return ok(res, 'Item removed')
    })

    internalFindAll = catchAsync(async (req, res) => {
        const { page = 1, limit = 50 } = req.query
        const filter = buildAppointmentFilter(req.query)

        const response = await this.service.internalFindAll({
            page,
            limit,
            filter,
        })
        return ok(res, response)
    })
}

export const appointmentController = new AppointmentController()
