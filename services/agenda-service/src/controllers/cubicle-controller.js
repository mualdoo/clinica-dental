import { Cubicle } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';

class CubicleService extends BaseService {
    constructor() {
        super(Cubicle);
    }
}

class CubicleController extends BaseController {
    constructor() {
        super(new CubicleService());
    }
}

export default new CubicleController();