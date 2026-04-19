import { Tooth } from '../models/index.js'
import {
    BaseAssociatedService,
    BaseAssociatedController,
} from './base/base-associated-controler.js'
import { ok, catchAsync } from '@mualdoo/shared'

class ToothService extends BaseAssociatedService {
    constructor() {
        super(Tooth)
    }

    async findAll(patientId) {
        return this.model.findAll({
            where: { patientId },
            attributes: ['id', 'number'],
        })
    }

    async findByNumber(patientId, number) {
        return this.model.findAll({
            where: {
                patientId,
                number,
            },
        })
    }
}

export const toothService = new ToothService()

class ToothController extends BaseAssociatedController {
    constructor() {
        super(toothService)
    }

    findByNumber = catchAsync(async (req, res) => {
        const response = await this.service.findByNumber(
            req.params.id,
            req.params.toothNumber
        )
        return ok(res, response)
    })
}

export const toothController = new ToothController()
