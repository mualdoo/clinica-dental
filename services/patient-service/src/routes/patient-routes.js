import { Router } from 'express'
const router = Router()
import { patientController } from '../controllers/patient-controller.js'
import { healthAlertController } from '../controllers/alert-controller.js'
import { toothController } from '../controllers/tooth-controller.js'
import { clinicalNoteController } from '../controllers/note-controller.js'
import { patientFileController } from '../controllers/patient-file-controller.js'

import { verifyInternalKey } from '../middleware/internal.js'
import { authorize } from '../middleware/role-check.js'

// Basic patient routes
router.get(
    '/',
    authorize(['admin', 'receptionist', 'dentist']),
    patientController.findAll
)
router.get(
    '/:id',
    authorize(['admin', 'receptionist', 'dentist', 'patient']),
    patientController.findById
)
router.post(
    '/',
    authorize(['admin', 'receptionist', 'patient']),
    patientController.create
)
router.patch(
    '/:id',
    authorize(['admin', 'receptionist', 'patient']),
    patientController.update
)
router.delete(
    '/:id',
    authorize(['admin', 'receptionist']),
    patientController.remove
)

// Health alerts
router.get('/:id/alert', healthAlertController.findAll)
router.get('/:id/alert/:itemId', healthAlertController.findById)
router.post('/:id/alert', healthAlertController.create)
router.patch('/:id/alert/:itemId', healthAlertController.update)
router.delete('/:id/alert/:itemId', healthAlertController.remove)

// Odontogram
router.get('/:id/tooth', toothController.findAll)
router.get('/:id/tooth/:itemId', toothController.findById)
router.get('/:id/tooth/number/:toothNumber', toothController.findByNumber)
router.post('/:id/tooth', toothController.create)
router.patch('/:id/tooth/:itemId', toothController.update)
router.delete('/:id/tooth/:itemId', toothController.remove)

// Clinical notes
router.get('/:id/note', clinicalNoteController.findAll)
router.get('/:id/note/:itemId', clinicalNoteController.findById)
router.post('/:id/note', clinicalNoteController.create)
router.patch('/:id/note/:itemId', clinicalNoteController.update)
router.delete('/:id/note/:itemId', clinicalNoteController.remove)

// Files
router.get('/:id/file', patientFileController.findAll)
router.get('/:id/file/:itemId', patientFileController.findById)
router.post('/:id/file', patientFileController.create)
router.patch('/:id/file/:itemId', patientFileController.update)
router.delete('/:id/file/:itemId', patientFileController.remove)

// Internal
router.get(
    'internal/verify-patient',
    verifyInternalKey,
    patientController.verifyPatient
)
router.get(
    'internal/patient-exists',
    verifyInternalKey,
    patientController.patientExists
)

export default router
