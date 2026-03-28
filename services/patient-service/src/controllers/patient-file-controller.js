import { PatientFile } from '../models/index.js';
import { BaseAssociatedService, BaseAssociatedController } from './base/base-associated-controler.js';

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

export default new PatientFileController();