const { HealthAlert } = require('../models');
const { BaseService, BaseController } = require('./base-controller');
const { ok, catchAsync } = require('@mualdoo/shared');

class HealthAlertService extends BaseService {
    constructor() {
        super(HealthAlert);
    }

    async findAll(patientId) {
        return this.model.findAll({ where: { patientId } });
    }
}

class HealthAlertController extends BaseController {
    constructor() {
        super(new HealthAlertService());
    }

    findAll = catchAsync(async (req, res) => {
        const response = await this.service.findAll(req.params.id);
        return ok(res, response);
    });

    findById = catchAsync(async (req, res) => {
        const response = await this.service.findById(req.params.alertId);
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
            req.params.alertId,
            req.body
        );
        return ok(res, response);
    });

    remove = catchAsync(async (req, res) => {
        await this.service.remove(req.params.alertId);
        return ok(res, 'Item removed');
    });
}

module.exports = new HealthAlertController();