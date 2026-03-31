import { PaymentPlan } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';

class PaymentPlanService extends BaseService {
    constructor() {
        super(PaymentPlan);
    }
}

class PaymentPlanController extends BaseController {
    constructor() {
        super(new PaymentPlanService());
    }

    create = catchAsync(async (req, res) => {
        const { id } = req.params;
        const response = await this.service.create({
            ...req.body,
            quoteId: id
        });
        return ok(res, response, 201);
    });

    update = catchAsync(async (req, res) => {
        const { validUntil } = req.body;
        const response = await this.service.update(req.params.id, { validUntil });
        return ok(res, response);
    });
}

export default new PaymentPlanController();