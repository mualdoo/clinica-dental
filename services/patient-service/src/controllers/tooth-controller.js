import { Tooth } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controler.js'
import { ok, catchAsync } from '@mualdoo/shared'
import { Op } from 'sequelize'

/**
 * Notifica al gateway para que emita el evento WS.
 * Se hace HTTP interno — el WS vive en el gateway, no aquí.
 * @param {string} patientId
 * @param {"created"|"updated"|"deleted"} event
 * @param {object} payload
 */
async function notifyGateway(patientId, event, payload) {
    try {
        await fetch(`${process.env.GATEWAY_URL}/internal/tooth-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
            },
            body: JSON.stringify({ patientId, event, ...payload }),
        })
    } catch (err) {
        // No lanzar error — el WS es best-effort, no bloquea la operación
        console.error('[WS] Error notificando al gateway:', err.message)
    }
}

class ToothService extends BaseService {
    constructor() {
        super(Tooth)
    }

    async create(data, createdBy) {
        const tooth = await this.model.create({ ...data, createdBy })

        await notifyGateway(data.patientId, 'created', { tooth })

        return tooth
    }

    async update(id, data) {
        const tooth = await Tooth.findByPk(id)
        if (!tooth) throw new AppError('Item not found', 404)
        await tooth.update(data)

        await notifyGateway(data.patientId, 'updated', { tooth })

        return tooth
    }

    async remove(id) {
        const tooth = await this.model.findByPk(id)
        if (!tooth) throw new AppError('Item not found', 404)
        await tooth.destroy()

        await notifyGateway(tooth.patientId, 'deleted', {
            toothId: id,
            toothNumber: tooth.number,
        })
    }
}

export const toothService = new ToothService()

class ToothController extends BaseController {
    constructor() {
        super(toothService)
    }

    findByPatient = catchAsync(async (req, res) => {
        const user = this._getUserInHeaders(req)
        const {
            page = 1,
            limit = 10,
            startTime = null,
            endTime = null,
        } = req.query
        const { id = null } = req.params
        const filter = {}
        if (startTime && endTime) {
            filter.createdAt = {
                [Op.between]: [startTime, endTime],
            }
        }

        const response = await this.service.findByPatient(user, id, {
            page,
            limit,
            filter,
        })
        return ok(res, response)
    })
}

export const toothController = new ToothController()
