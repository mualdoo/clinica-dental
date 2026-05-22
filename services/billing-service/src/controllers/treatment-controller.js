import { Treatment } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import { ok, catchAsync } from '@mualdoo/shared'

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

    findAll = catchAsync(async (req, res) => {
        const { page = 1, limit = 10, name = null } = req.query
        const filter = {}
        if (name) {
            filter.name = name
        }

        const response = await this.service.findAll({ page, limit, filter })
        return ok(res, response)
    })
}

export const treatmentController = new TreatmentController()
