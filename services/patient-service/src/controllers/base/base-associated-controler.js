import { BaseService, BaseController } from './base-controller.js';
import { ok, catchAsync } from '@mualdoo/shared';

export class BaseAssociatedService extends BaseService {
    async findAll(patientId) {
        return this.model.findAll({ where: { patientId } });
    }
}

export class BaseAssociatedController extends BaseController {
    findAll = catchAsync(async (req, res) => {
        const response = await this.service.findAll(req.params.id);
        return ok(res, response);
    });

    findById = catchAsync(async (req, res) => {
        const response = await this.service.findById(req.params.itemId);
        return ok(res, response);
    });

    create = catchAsync(async (req, res) => {
        const response = await this.service.create({
            ...req.body,
            patientId: req.params.id
        });
        return ok(res, response, 201);
    });

    update = catchAsync(async (req, res) => {
        const response = await this.service.update(
            req.params.itemId,
            req.body
        );
        return ok(res, response);
    });

    remove = catchAsync(async (req, res) => {
        await this.service.remove(req.params.itemId);
        return ok(res, 'Item removed');
    });
}