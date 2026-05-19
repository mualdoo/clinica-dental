import { Payment, Quote } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'
import { ok, AppError, catchAsync } from '@mualdoo/shared'

const validatePayment = async (quoteId, newAmount) => {
    const quote = await Quote.findByPk(quoteId)
    if (!quote) throw new AppError('Quote not found')

    if (!quote.isActive()) throw new AppError('Quote is not active')
    if (quote.isOverdue()) throw new AppError('Quote is overdue')

    const totalPaid = await Payment.sum('amount', {
        where: {
            quoteId,
            status: 'completed',
        },
    })
    if (!quote.isAmountValid(totalPaid + newAmount))
        throw new AppError('Invalid amount')
}

class PaymentService extends BaseService {
    constructor() {
        super(Payment)
    }

    async create(data) {
        await validatePayment(data.quoteId, data.amount)
        return this.model.create(data)
    }
}

export const paymentService = new PaymentService()

class PaymentController extends BaseController {
    constructor() {
        super(paymentService)
    }

    findAll = catchAsync(async (req, res) => {
        const { page = 1, limit = 10, quoteId = null } = req.query
        let filter = {}
        if (quoteId) filter.quoteId = quoteId

        const response = await this.service.findAll({ page, limit, filter })
        return ok(res, response)
    })

    create = catchAsync(async (req, res) => {
        const { id } = req.params
        const response = await this.service.create({
            ...req.body,
            quoteId: id,
        })
        return ok(res, response, 201)
    })
}

export const paymentController = new PaymentController()
