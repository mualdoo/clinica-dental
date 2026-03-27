const { Tooth } = require('../models');
const { BaseAssociatedService, BaseAssociatedController } = require('./base/base-associated-controler');
const { ok, catchAsync } = require('@mualdoo/shared');

class ToothService extends BaseAssociatedService {
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

class ToothController extends BaseAssociatedController {
    constructor() {
        super(new ToothService());
    }

    findByNumber = catchAsync(async (req, res) => {
        const response = await this.service.findByNumber(req.params.id, req.params.toothNumber);
        return ok(res, response);
    });
}

module.exports = new ToothController();