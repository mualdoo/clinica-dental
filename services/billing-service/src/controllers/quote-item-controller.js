import { QuoteItem } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';

class QuoteItemService extends BaseService {
    constructor() {
        super(QuoteItem);
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