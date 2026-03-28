const { Appointment, Cubicle } = require('../models');
const { BaseService, BaseController } = require('./base/base-controller');

class AppointmentService extends BaseService {
    constructor() {
        super(Appointment);
    }

    async findById(id) {
        const instance = await this.model.findByPk(id, { include: Cubicle });
        if (!instance) throw new AppError('Item not found', 404);
        return instance
    }
}

class AppointmentController extends BaseController {
    constructor() {
        super(new AppointmentService());
    }
}

module.exports = new AppointmentController();