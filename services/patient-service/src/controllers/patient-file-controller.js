import { PatientFile } from '../models/index.js'
import {
    BaseAssociatedService,
    BaseAssociatedController,
} from './base/base-associated-controler.js'

class PatientFileService extends BaseAssociatedService {
    constructor() {
        super(PatientFile)
    }
}

export const patientFileService = new PatientFileService()

class PatientFileController extends BaseAssociatedController {
    constructor() {
        super(patientFileService)
    }
}

export const patientFileController = new PatientFileController()
