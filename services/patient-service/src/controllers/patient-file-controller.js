import { Patient, PatientFile } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controler.js'
import { ok, catchAsync, AppError, publishEvent } from '@mualdoo/shared'
import amqp from 'amqplib'

class PatientFileService extends BaseService {
    constructor() {
        super(PatientFile)
    }

    async internalCreate(data) {
        return this.model.create(data)
    }

    async sendToPatient(fileId) {
        const file = await PatientFile.findByPk(fileId, { include: Patient })
        if (!file) throw new AppError('El archivo no existe')

        const patient = file.Patient

        await publishEvent(
            amqp,
            'send_file_to_patient',
            process.env.RABBITMQ_URL,
            {
                patientId: patient.id,
                email: patient.email,
                name: patient.name,
                lastName: patient.lastName,
                link: file.storageKey,
            }
        )

        return 'Archivo enviado con éxito'
    }
}

export const patientFileService = new PatientFileService()

class PatientFileController extends BaseController {
    constructor() {
        super(patientFileService)
    }

    internalCreate = catchAsync(async (req, res) => {
        const { id } = req.params
        const response = await this.service.internalCreate({
            ...req.body,
            patientId: id,
        })
        return ok(res, response, 201)
    })

    sendToPatient = catchAsync(async (req, res) => {
        const { id } = req.params

        const response = await this.service.sendToPatient(id)

        return ok(res, response)
    })
}

export const patientFileController = new PatientFileController()
