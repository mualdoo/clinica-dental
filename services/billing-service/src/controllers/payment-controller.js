import { Payment } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';

class PaymentService extends BaseService {
    constructor() {
        super(Payment);
    }
}

class PaymentController extends BaseController {
    constructor() {
        super(new PaymentService());
    }

    create = catchAsync(async (req, res) => {
        const { id } = req.params;
        const response = await this.service.create({
            ...req.body,
            paymentPlanId: id
        });
        return ok(res, response, 201);
    });
}

export default new PaymentController();