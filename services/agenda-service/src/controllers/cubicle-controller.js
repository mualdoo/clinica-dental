const { Cubicle } = require('../models');
const { BaseService, BaseController } = require('./base/base-controller');

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

module.exports = new CubicleController();