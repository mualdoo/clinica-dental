import { Quote, QuoteItem, Treatment } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';
import fetchPatient from '../services/patient-service.js';

const verifyPatient = async (patientId) => {
    const patient = await fetchPatient(patientId);
    if (!patient) throw new AppError('Patient not found');
};

class QuoteService extends BaseService {
    constructor() {
        super(Quote);
    }
    
    async findById(id) {
        const instance = await this.model.findByPk(id, {
            include: {
                model: QuoteItem,
                include: Treatment
            }
        });
        if (!instance) throw new AppError('Item not found', 404);
        return instance
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

    create = catchAsync(async (req, res) => {
        const { patientId } = req.body;
        
        await verifyPatient(patientId);

        const response = await this.service.create(req.body);
        return ok(res, response, 201);
    });
}

export default new QuoteController();