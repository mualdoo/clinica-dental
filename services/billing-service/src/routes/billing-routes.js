import { Router } from 'express'
const router = Router()
import { authorize } from '../middleware/role-check.js'

import { treatmentController } from '../controllers/treatment-controller.js'
import { quoteController } from '../controllers/quote-controller.js'
import { quoteItemController } from '../controllers/quote-item-controller.js'
import { paymentController } from '../controllers/payment-controller.js'

// Treatment
router.get(
    '/treatment',
    authorize(['admin', 'receptionist', 'dentist']),
    treatmentController.findAll
)
router.get(
    '/treatment/:id',
    authorize(['admin', 'receptionist', 'dentist']),
    treatmentController.findById
)
router.post(
    '/treatment',
    authorize(['admin', 'receptionist']),
    treatmentController.create
)
router.patch(
    '/treatment/:id',
    authorize(['admin', 'receptionist']),
    treatmentController.update
)
router.delete(
    '/treatment/:id',
    authorize(['admin', 'receptionist']),
    treatmentController.remove
)

// Quote
router.get(
    '/quote',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteController.findAll
)
router.get(
    '/quote/:id',
    authorize(['admin', 'receptionist', 'dentist', 'patient']),
    quoteController.findById
)
router.get(
    '/quote/patient/:patientId',
    authorize(['admin', 'receptionist', 'dentist', 'patient']),
    quoteController.findByPatient
)
router.post(
    '/quote',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteController.create
)
router.patch(
    '/quote/:id',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteController.update
)
router.delete(
    '/quote/:id',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteController.remove
)

// Quote Item
router.post(
    '/quote/:id/item',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteItemController.create
)

router.get(
    '/quote-item',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteItemController.findAll
)
router.get(
    '/quote-item/:id',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteItemController.findById
)
router.patch(
    '/quote-item/:id',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteItemController.update
)
router.delete(
    '/quote-item/:id',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteItemController.remove
)

// Payment
router.post(
    '/quote/:id/payment',
    authorize(['admin', 'receptionist']),
    paymentController.create
)

router.get(
    '/payment',
    authorize(['admin', 'receptionist']),
    paymentController.findAll
)
router.get(
    '/payment/:id',
    authorize(['admin', 'receptionist']),
    paymentController.findById
)

// Generate pdf
router.post(
    '/quote/:id/generate-pdf',
    authorize(['admin', 'receptionist', 'dentist']),
    quoteController.generatePdf
)

export default router
