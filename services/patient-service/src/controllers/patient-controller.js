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

    async verifyPatient(where) {
        const patient = await this.model.findOne({ where })
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

export default new PatientController()
