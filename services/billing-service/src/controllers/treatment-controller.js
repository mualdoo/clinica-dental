import { Treatment } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'

class TreatmentService extends BaseService {
    constructor() {
        super(Treatment)
    }
}

export const treatmentService = new TreatmentService()

class TreatmentController extends BaseController {
    constructor() {
        super(treatmentService)
    }
}

export const treatmentController = new TreatmentController()
