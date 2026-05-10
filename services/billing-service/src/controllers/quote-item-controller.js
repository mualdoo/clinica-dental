import { ok, AppError, catchAsync } from '@mualdoo/shared'
import { Quote, QuoteItem, Treatment, sequelize } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'

const validateItem = async (quoteId) => {
    const quote = await Quote.findByPk(quoteId)
    if (!quote) throw new AppError('Quote not found')

    if (quote.isActive()) throw new AppError('Active quotes cannot be changed')
    return quote
}

const recalculateQuoteTotal = async (quoteId, transaction = null) => {
    const items = await QuoteItem.findAll({
        where: { quoteId },
        include: [
            {
                model: Treatment,
                as: 'treatment', // Usa el alias definido en tus asociaciones
                attributes: ['unitPrice'],
            },
        ],
        transaction,
    })

    let newTotal = 0

    for (const item of items) {
        if (!item.treatment) continue

        const unitPrice = Number(item.treatment.unitPrice)
        const discount = Number(item.discount || 0) // Ej: 0.2 para 20%

        const finalPrice = unitPrice * (1 - discount)

        newTotal += finalPrice
    }

    newTotal = Math.round(newTotal * 100) / 100

    await Quote.update(
        { total: newTotal },
        { where: { id: quoteId }, transaction }
    )

    return newTotal
}

class QuoteItemService extends BaseService {
    constructor() {
        super(QuoteItem)
    }

    async create(data) {
        const t = await sequelize.transaction()

        try {
            const newItem = await QuoteItem.create(data, { transaction: t })

            await recalculateQuoteTotal(newItem.quoteId, t)

            await t.commit()

            return newItem
        } catch (error) {
            await t.rollback()
            console.error('Error al crear el QuoteItem:', error)
            throw error
        }
    }

    async update(id, data) {
        const instance = await this.model.findByPk(id, { include: Quote })

        if (!instance) throw new AppError('Item not found', 404)
        if (instance.Quote.isActive())
            throw new AppError('Active quotes cannot be changed')

        const t = await sequelize.transaction()

        try {
            const newItem = await instance.update(data, { transaction: t })

            await recalculateQuoteTotal(newItem.quoteId, t)

            await t.commit()

            return newItem
        } catch (error) {
            await t.rollback()
            console.error('Error al editar el QuoteItem:', error)
            throw error
        }
    }

    async remove(id) {
        const instance = await this.model.findByPk(id, { include: Quote })

        if (!instance) throw new AppError('Item not found', 404)
        if (instance.Quote.isActive())
            throw new AppError('Active quotes cannot be changed')

        const t = await sequelize.transaction()

        try {
            const quoteId = instance.quoteId
            await instance.destroy({ transaction: t })

            await recalculateQuoteTotal(quoteId, t)

            await t.commit()
        } catch (error) {
            await t.rollback()
            console.error('Error al eliminar el QuoteItem:', error)
            throw error
        }

        await instance.destroy()
    }
}

export const quoteItemService = new QuoteItemService()

class QuoteItemController extends BaseController {
    constructor() {
        super(quoteItemService)
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

export const quoteItemController = new QuoteItemController()
