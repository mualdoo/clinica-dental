import { Appointment, Cubicle } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';

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

    create = catchAsync(async (req, res) => {
        // TODO add validation
        const response = await this.service.create(req.body);
        return ok(res, response, 201);
    });
}

export default new AppointmentController();