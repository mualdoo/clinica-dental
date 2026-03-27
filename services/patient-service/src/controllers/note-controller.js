const { ClinicalNote } = require('../models');
const { BaseAssociatedService, BaseAssociatedController } = require('./base/base-associated-controler');

class ClinicalNoteService extends BaseAssociatedService {
    constructor() {
        super(ClinicalNote);
    }
}

class ClinicalNoteController extends BaseAssociatedController {
    constructor() {
        super(new ClinicalNoteService());
    }
}

module.exports = new ClinicalNoteController();