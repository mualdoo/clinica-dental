const { HealthAlert } = require('../models');
const { BaseAssociatedService, BaseAssociatedController } = require('./base/base-associated-controler');

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

module.exports = new HealthAlertController();