import { Router } from 'express'
const router = Router()
import { cubicleController } from '../controllers/cubicle-controller.js'
import { appointmentController } from '../controllers/appointment-controller.js'
import { authorize } from '../middleware/role-check.js'
import { verifyInternalKey } from '../middleware/internal.js'

// Cubicle
router.get(
    '/cubicle',
    authorize(['admin', 'dentist', 'receptionist']),
    cubicleController.findAll
)
router.get(
    '/cubicle/:id',
    authorize(['admin', 'dentist', 'receptionist']),
    cubicleController.findById
)
router.post(
    '/cubicle',
    authorize(['admin', 'receptionist']),
    cubicleController.create
)
router.patch(
    '/cubicle/:id',
    authorize(['admin', 'receptionist']),
    cubicleController.update
)
router.delete(
    '/cubicle/:id',
    authorize(['admin', 'receptionist']),
    cubicleController.remove
)

// Appointments
router.get(
    '/appointment',
    authorize(['admin', 'receptionist', 'dentist', 'patient']),
    appointmentController.findAll
)
router.get(
    '/appointment/:id',
    authorize(['admin', 'receptionist', 'dentist', 'patient']),
    appointmentController.findById
)
router.post(
    '/appointment',
    authorize(['admin', 'receptionist', 'patient']),
    appointmentController.create
)
router.patch(
    '/appointment/:id',
    authorize(['admin', 'receptionist', 'patient']),
    appointmentController.update
)
router.delete(
    '/appointment/:id',
    authorize(['admin', 'receptionist', 'patient']),
    appointmentController.remove
)

// Internal
router.get(
    '/internal/appointment',
    verifyInternalKey,
    appointmentController.internalFindAll
)

export default router
