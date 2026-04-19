import { HealthAlert } from '../models/index.js'
import {
    BaseAssociatedService,
    BaseAssociatedController,
} from './base/base-associated-controler.js'

class HealthAlertService extends BaseAssociatedService {
    constructor() {
        super(HealthAlert)
    }
}

export const healthAlertService = new HealthAlertService()

class HealthAlertController extends BaseAssociatedController {
    constructor() {
        super(healthAlertService)
    }
}

export const healthAlertController = new HealthAlertController()
