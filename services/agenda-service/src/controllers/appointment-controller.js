import { Op } from 'sequelize';
import { ok, catchAsync, AppError } from '@mualdoo/shared';
import { Appointment, Cubicle } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';
import fetchUser from '../services/auth-service.js';

const validateUser = async (id, role) => {
    const user = await fetchUser(id);
    if (!user || user.role !== role) throw new AppError(`${role} not found`);
};

const validateSchedule = async (data, id = null) => {
    const { cubicleId, patientId, dentistId, startTime, endTime } = data;

    const conditions = [];
    if (cubicleId) conditions.push({ cubicleId });
    if (patientId) conditions.push({ patientId });
    if (dentistId) conditions.push({ dentistId });

    if (conditions.length === 0) return;

    const whereClause = {
        status: 'scheduled',
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime },
        [Op.or]: conditions
    };
    if (id) whereClause.id = { [Op.ne]: id };

    const collision = await Appointment.findOne({ where: whereClause});
    
    if (collision) {
        if (cubicleId && collision.cubicleId === cubicleId) throw new AppError('Cubicle occupied');
        if (patientId && collision.patientId === patientId) throw new AppError('Patient occupied');
        if (dentistId && collision.dentistId === dentistId) throw new AppError('Dentist occupied');
    }
};

class AppointmentService extends BaseService {
    constructor() {
        super(Appointment);
    }

    async findById(id) {
        const instance = await this.model.findByPk(id, { include: Cubicle });
        if (!instance) throw new AppError('Item not found', 404);
        return instance
    }
}

class AppointmentController extends BaseController {
    constructor() {
        super(new AppointmentService());
    }

    create = catchAsync(async (req, res) => {
        const { patientId, dentistId } = req.body;

        await validateUser(patientId, 'patient');
        await validateUser(dentistId, 'dentist');
        await validateSchedule(req.body);

        const response = await this.service.create(req.body);
        return ok(res, response, 201);
    });

    update = catchAsync(async (req, res) => {
        const { patientId, dentistId } = req.body;
        const { id } = req.params;

        if (patientId) await validateUser(patientId, 'patient');
        if (dentistId) await validateUser(dentistId, 'dentist');
        await validateSchedule(req.body, id);
        
        const response = await this.service.update(id, req.body);
        return ok(res, response);
    });
}

export default new AppointmentController();