import { PatientFile } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controler.js'

class PatientFileService extends BaseService {
    constructor() {
        super(PatientFile)
    }
}

export const patientFileService = new PatientFileService()

class PatientFileController extends BaseController {
    constructor() {
        super(patientFileService)
    }
}

export const patientFileController = new PatientFileController()
