import { Treatment } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';

class TreatmentService extends BaseService {
    constructor() {
        super(Treatment);
    }
}

class TreatmentController extends BaseController {
    constructor() {
        super(new TreatmentService());
    }
}

export default new TreatmentController();