import { Patient } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import { ok, catchAsync, publishEvent } from '@mualdoo/shared'
import amqp from 'amqplib'

class PatientService extends BaseService {
    constructor() {
        super(Patient)
    }

    async findAll() {
        return this.model.findAll({
            attributes: ['id', 'name', 'lastName', 'email', 'phone'],
        })
    }

    async verifyPatient(patientId, authUserId) {
        const patient = await this.model.findOne({
            where: {
                id: patientId,
                authUserId,
            },
        })
        return !!patient
    }
}

class PatientController extends BaseController {
    constructor() {
        super(new PatientService())
    }

    create = catchAsync(async (req, res) => {
        const patient = await this.service.create(req.body)

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

    verifyPatient = catchAsync(async (req, res) => {
        const { patientId, authUserId } = req.query

        const valid = await this.service.verifyPatient(patientId, authUserId)

        return ok(res, valid)
    })
}

export default new PatientController()
