import { ok, AppError, catchAsync } from '@mualdoo/shared';
import { Quote, QuoteItem } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';

const validateItem = async (quoteId) => {
    const quote = await Quote.findByPk(quoteId);
    if (!quote) throw new AppError('Quote not found');
    
    if (quote.isActive()) throw new AppError('Active quotes cannot be changed');
};

class QuoteItemService extends BaseService {
    constructor() {
        super(QuoteItem);
    }

    async create(data) {
        await validateItem(data.quoteId);

        return this.model.create(data);
    }

    async update(id, data) {
        const instance = await this.model.findByPk(id, { include: Quote });

        if (!instance) throw new AppError('Item not found', 404);
        if (instance.Quote.isActive()) throw new AppError('Active quotes cannot be changed');

        return instance.update(data);
    }

    async remove(id) {
        const instance = await this.model.findByPk(id, { include: Quote });

        if (!instance) throw new AppError('Item not found', 404);
        if (instance.Quote.isActive()) throw new AppError('Active quotes cannot be changed');
        
        await instance.destroy();
    }
}

class QuoteItemController extends BaseController {
    constructor() {
        super(new QuoteItemService());
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

export default new QuoteItemController();