const { Patient } = require('../models');
const { BaseService, BaseController } = require('./base-controller');
const { ok, catchAsync, publishEvent } = require('@mualdoo/shared');
const amqp = require('amqplib');

class PatientService extends BaseService {
    constructor() {
        super(Patient);
    }

    async findAll() {
        return this.model.findAll({ attributes: ['id', 'name', 'lastName', 'email', 'phone'] });
    }
}

class PatientController extends BaseController {
    constructor() {
        super(new PatientService());
    }

    create = catchAsync(async (req, res) => {
        const patient = await this.service.create(req.body);

        await publishEvent(
            amqp,
            'patient_created_exchange',
            process.env.RABBITMQ_URL,
            {
                email: patient.email,
                name: patient.name,
                lastName: patient.lastName
            }
        );

        return ok(res, patient, 201);
    });
}

module.exports = new PatientController();