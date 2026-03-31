import { Payment, Quote } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';
import { ok, AppError, catchAsync } from '@mualdoo/shared';

const validatePayment = async (quoteId, newAmount) => {
    const quote = await Quote.findByPk(quoteId);
    if (!quote) throw new AppError('Quote not found');

    if (!quote.isActive()) throw new AppError('Quote is not active');
    if (quote.isOverdue()) throw new AppError('Quote is overdue');

    const totalPaid = await Payment.sum('amount', {
        where: {
            quoteId,
            status: 'completed'
        }
    });
    if (!quote.isAmountValid(totalPaid + newAmount)) throw new AppError('Invalid amount');
};

class PaymentService extends BaseService {
    constructor() {
        super(Payment);
    }

    async create(data) {
        await validatePayment(data.quoteId, data.amount);
        return this.model.create(data);
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
            quoteId: id
        });
        return ok(res, response, 201);
    });
}

export default new PaymentController();