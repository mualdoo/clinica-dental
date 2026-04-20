import { Tooth } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controler.js'
import { ok, catchAsync } from '@mualdoo/shared'

class ToothService extends BaseService {
    constructor() {
        super(Tooth)
    }
}

export const toothService = new ToothService()

class ToothController extends BaseController {
    constructor() {
        super(toothService)
    }
}

export const toothController = new ToothController()
