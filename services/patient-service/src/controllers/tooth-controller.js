const { Tooth } = require('../models');
const { BaseService, BaseController } = require('./base-controller');
const { ok, catchAsync } = require('@mualdoo/shared');

class ToothService extends BaseService {
    constructor() {
        super(Tooth);
    }

    async findAll(patientId) {
        return this.model.findAll({
            where: { patientId },
            attributes: ['id', 'number']
        });
    }

    async findByNumber(patientId, number) {
        return this.model.findAll({
            where: {
                patientId,
                number
            }
        });
    }
}

class ToothController extends BaseController {
    constructor() {
        super(new ToothService());
    }

    findAll = catchAsync(async (req, res) => {
        const response = await this.service.findAll(req.params.id);
        return ok(res, response);
    });

    findById = catchAsync(async (req, res) => {
        const response = await this.service.findById(req.params.toothId);
        return ok(res, response);
    });

    findByNumber = catchAsync(async (req, res) => {
        const response = await this.service.findByNumber(req.params.id, req.params.toothNumber);
        return ok(res, response);
    });

    create = catchAsync(async (req, res) => {
        const response = await this.service.create({
            ...req.body,
            patientId: req.params.id
        });
        return ok(res, response);
    });

    update = catchAsync(async (req, res) => {
        const response = await this.service.update(
            req.params.toothId,
            req.body
        );
        return ok(res, response);
    });

    remove = catchAsync(async (req, res) => {
        await this.service.remove(req.params.toothId);
        return ok(res, 'Item removed');
    });
}

module.exports = new ToothController();