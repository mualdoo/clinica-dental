import { Cubicle } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'

class CubicleService extends BaseService {
    constructor() {
        super(Cubicle)
    }
}

export const cubicleService = new CubicleService()

class CubicleController extends BaseController {
    constructor() {
        super(cubicleService)
    }
}

export const cubicleController = new CubicleController()
