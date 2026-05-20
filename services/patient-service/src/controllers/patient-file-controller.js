import { PatientFile } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controler.js'
import { ok, catchAsync } from '@mualdoo/shared'

class PatientFileService extends BaseService {
    constructor() {
        super(PatientFile)
    }

    async internalCreate(data) {
        return this.model.create(data)
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
}

export const patientFileController = new PatientFileController()
