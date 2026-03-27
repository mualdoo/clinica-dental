const { PatientFile } = require('../models');
const { BaseAssociatedService, BaseAssociatedController } = require('./base/base-associated-controler');

class PatientFileService extends BaseAssociatedService {
    constructor() {
        super(PatientFile);
    }
}

class PatientFileController extends BaseAssociatedController {
    constructor() {
        super(new PatientFileService());
    }
}

module.exports = new PatientFileController();