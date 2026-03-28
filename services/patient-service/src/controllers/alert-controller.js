import { HealthAlert } from '../models/index.js';
import { BaseAssociatedService, BaseAssociatedController } from './base/base-associated-controler.js';

class HealthAlertService extends BaseAssociatedService {
    constructor() {
        super(HealthAlert);
    }
}

class HealthAlertController extends BaseAssociatedController {
    constructor() {
        super(new HealthAlertService());
    }
}

export default new HealthAlertController();