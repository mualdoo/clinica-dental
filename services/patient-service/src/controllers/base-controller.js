const { ok, AppError, catchAsync } = require('@mualdoo/shared');

class BaseController {
    constructor(service) {
        this.service = service;
    }

    findAll = catchAsync(async (req, res) => {
        const response = await this.service.findAll();
        return ok(res, response);
    });

    findById = catchAsync(async (req, res) => {
        const response = await this.service.findById(req.params.id);
        return ok(res, response);
    });

    create = catchAsync(async (req, res) => {
        const response = await this.service.create(req.body);
        return ok(res, response, 201);
    });

    update = catchAsync(async (req, res) => {
        const response = await this.service.update(req.params.id, req.body);
        return ok(res, response);
    });

    remove = catchAsync(async (req, res) => {
        await this.service.remove(req.params.id);
        return ok(res, 'Item removed');
    });
}

class BaseService {
    constructor(model) {
        this.model = model;
    }

    async findAll() {
        const result = await this.model.findAll();
        return result;
    }

    async findById(id) {
        return this.model.findByPk(id);
    }

    async create(data) {
        return this.model.create(data);
    }

    async update(id, data) {
        const instance = await this.model.findByPk(id);
        if (!instance) throw new AppError('Item not found', 404);
        return instance.update(data);
    }

    async remove(id) {
        const instance = await this.model.findByPk(id);
        if (!instance) throw new AppError('Item not found', 404);
        await instance.destroy();
    }
}

module.exports = { BaseController, BaseService };