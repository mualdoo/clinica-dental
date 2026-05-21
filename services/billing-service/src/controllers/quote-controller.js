import { Quote, QuoteItem, Treatment, Payment } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import {
    verifyPatient,
    patientExists,
    createPatientPdf,
} from '../services/patient-service.js'
import { ok, AppError, catchAsync } from '@mualdoo/shared'
import { getPdfBuffer } from '../services/pdf-service.js'
import { uploadFile } from '../services/storage-service.js'

class QuoteService extends BaseService {
    constructor() {
        super(Quote)
    }

    async _verifyOwnership(user) {
        if (user.role !== 'patient') return

        const valid = await verifyPatient(user.activePatientId, user.authUserId)
        if (!valid) throw new AppError('Permission denied', 403)
    }

    _getIncludeStructure() {
        return [
            {
                model: QuoteItem,
                as: 'items',
                include: {
                    model: Treatment,
                    as: 'treatment',
                },
            },
            {
                model: Payment,
                as: 'Payments',
            },
        ]
    }

    async findAll(user, { page, limit, filter = {} } = {}) {
        const offset = (page - 1) * limit

        if (user.role === 'patient') {
            filter.patientId = user.activePatientId
        }

        const result = await this.model.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            where: filter,
            include: this._getIncludeStructure(),
        })

        return {
            data: result.rows,
            total: result.count,
            page: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
        }
    }

    async findById(user, id) {
        await this._verifyOwnership(user)

        const instance = await Quote.findByPk(id, {
            include: this._getIncludeStructure(),
        })

        if (!instance) throw new AppError('Item not found', 404)

        return instance
    }

    async create(data) {
        const { patientId } = data

        const valid = await patientExists(patientId)
        if (!valid) throw new AppError('Patient not found', 404)

        return this.model.create(data)
    }

    async update(id, data) {
        const { patientId = null } = data
        const instance = await this.model.findByPk(id)
        if (!instance) throw new AppError('Item not found', 404)

        if (patientId) {
            const valid = await patientExists(patientId)
            if (!valid) throw new AppError('Patient not found', 404)
        }

        return instance.update(data)
    }

    async generatePdf(quoteId, adminId, createPatientFile = false) {
        const quote = await Quote.findByPk(quoteId, {
            include: this._getIncludeStructure(),
        })
        if (!quote) throw new AppError('Quote not found')

        const patient = await patientExists(quote.patientId)
        if (!patient) throw new AppError('Patient not found')

        // hacer request a pdf service
        const pdfBuffer = await getPdfBuffer({
            patientName: `${patient.name} ${patient.lastName}`,
            patientEmail: patient.email,
            ...quote.toJSON(),
        })

        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })

        // con el contenido, hacer request a storage service
        let link =
            'https://jqikfytejgwtjobdudrt.supabase.co/storage/v1/object/public/archivos-clinica/uploads/1779304928889_presupuesto-8e761e34-b174-4510-9ad3-24f1141c6248.pdf'
        if (!patient.email.includes('@falso.com')) {
            link = await uploadFile(pdfBlob, quoteId)
        }

        // Opcional: subir a patient-service
        if (createPatientFile) {
            const patientFile = await createPatientPdf(patient.id, {
                type: 'document',
                filename: `presupuesto-${quoteId}.pdf`,
                storageKey: link,
                mimeType: pdfBlob.type,
                sizeBytes: pdfBlob.size,
                createdBy: adminId,
            })

            if (!patientFile)
                throw new AppError('Error guardando el archivo del paciente')
        }

        // regresar el link del archivo
        return link
    }
}

export const quoteService = new QuoteService()

class QuoteController extends BaseController {
    constructor() {
        super(quoteService)
    }

    _getUserInHeaders(req) {
        const user = {}
        user.authUserId = req.headers['x-user-id']
        user.activePatientId = req.headers['x-active-patient-id']
        user.role = req.headers['x-user-role']
        return user
    }

    findAll = catchAsync(async (req, res) => {
        const { page = 1, limit = 10, status = null } = req.query
        const user = this._getUserInHeaders(req)

        const filter = {}
        if (status) filter.status = status

        const response = await this.service.findAll(user, {
            page,
            limit,
            filter,
        })
        return ok(res, response)
    })

    findByPatient = catchAsync(async (req, res) => {
        const { page = 1, limit = 10 } = req.query
        const { patientId } = req.params
        const user = this._getUserInHeaders(req)

        const response = await this.service.findAll(user, {
            page,
            limit,
            filter: { patientId },
        })
        return ok(res, response)
    })

    generatePdf = catchAsync(async (req, res) => {
        const { id } = req.params
        const user = this._getUserInHeaders(req)
        const { createPatientFile = false } = req.body

        const link = await this.service.generatePdf(
            id,
            user.authUserId,
            createPatientFile
        )

        return ok(res, link)
    })
}

export const quoteController = new QuoteController()
