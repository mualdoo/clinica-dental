import { Op } from 'sequelize';
import { ok, catchAsync, AppError, publishEvent } from '@mualdoo/shared';
import { Appointment, Cubicle } from '../models/index.js';
import { BaseService, BaseController } from './base/base-controller.js';
import fetchUser from '../services/auth-service.js';
import amqp from 'amqplib';

const buildAppointmentFilter = (query) => {
    const { cubicleId, patientId, dentistId, startTime, endTime, status } = query;
    const where = {};

    if (cubicleId) where.cubicleId = cubicleId;
    if (patientId) where.patientId = patientId;
    if (dentistId) where.dentistId = dentistId;
    if (status) where.status = status;

    if (startTime || endTime) {
        where.startTime = {};

        if (startTime) where.startTime[Op.gte] = new Date(startTime);
        if (endTime) where.startTime[Op.lte] = new Date(endTime);
    }
    return where;
};

const validateUser = async (id, role) => {
    const user = await fetchUser(id);
    if (!user || user.role !== role) throw new AppError(`${role} not found`);
    return user;
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

    const collision = await Appointment.findOne({ where: whereClause });
    
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

    async findAll({ page, limit, filter = {} } = {}) {
        const offset = (page - 1) * limit;
        const result = await this.model.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            where: filter
        });

        return {
            data: result.rows,
            total: result.count,
            page: parseInt(page),
            totalPages: Math.ceil(result.count / limit)
        };
    }
}

class AppointmentController extends BaseController {
    constructor() {
        super(new AppointmentService());
    }

    findAll = catchAsync(async (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const filter = buildAppointmentFilter(req.query);
        
        const response = await this.service.findAll({ page, limit, filter });
        return ok(res, response);
    });

    create = catchAsync(async (req, res) => {
        const { patientId, dentistId } = req.body;

        const patient = await validateUser(patientId, 'patient');
        await validateUser(dentistId, 'dentist');
        await validateSchedule(req.body);

        const appointment = await this.service.create(req.body);

        await publishEvent(
            amqp,
            'appointment_created_exchange',
            process.env.RABBITMQ_URL,
            {
                email: patient.email,
                fullName: patient.fullName,
                appointmentDate: appointment.startTime
            }
        );

        return ok(res, appointment, 201);
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