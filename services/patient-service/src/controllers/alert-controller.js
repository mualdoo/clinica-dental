import { HealthAlert } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controler.js'

class HealthAlertService extends BaseService {
    constructor() {
        super(HealthAlert)
    }
}

export const healthAlertService = new HealthAlertService()

class HealthAlertController extends BaseController {
    constructor() {
        super(healthAlertService)
    }
}

export const healthAlertController = new HealthAlertController()
