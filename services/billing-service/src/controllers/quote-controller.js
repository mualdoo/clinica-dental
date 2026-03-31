import { Quote, QuoteItem, Treatment, Payment } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';
import fetchPatient from '../services/patient-service.js';
import { ok, AppError, catchAsync } from '@mualdoo/shared';

const validatePatient = async (patientId) => {
    const patient = await fetchPatient(patientId);
    if (!patient) throw new AppError('Patient not found');
};

class QuoteService extends BaseService {
    constructor() {
        super(Quote);
    }
    
    async findById(id) {
        // const instance = await this.model.findByPk(id, {
        const instance = Quote.findByPk(id, {
            include: [
                {
                    model: QuoteItem,
                    as: 'items',
                    attributes: ['id', 'toothNumber', 'discount'],
                    include: {
                        model: Treatment,
                        as: 'treatment',
                        attributes: { exclude: ['createdAt', 'updatedAt'] }
                    }
                },
                // {
                //     model: Payment,
                //     where: {
                //         status: 'completed'
                //     }
                // }
            ]
        });
        if (!instance) throw new AppError('Item not found', 404);
        return instance
    }

    async create(data) {
        const { patientId } = data;

        await validatePatient(patientId);
        
        return this.model.create(data);
    }
    
    async update(id, data) {
        const instance = await this.model.findByPk(id);
        if (!instance) throw new AppError('Item not found', 404);

        if (data.patientId) validatePatient(data.patientId);

        return instance.update(data);
    }
}

class QuoteController extends BaseController {
    constructor() {
        super(new QuoteService());
    }

    findByPatient = catchAsync(async (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const { patientId } = req.params;

        const response = await this.service.findAll({ page, limit, filter: { patientId } });
        return ok(res, response);
    });
}

export default new QuoteController();