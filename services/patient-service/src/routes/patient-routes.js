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
    authorize(['admin', 'receptionist', 'dentist', 'patient']),
    patientController.findAll
)
router.get(
    '/search',
    authorize(['admin', 'receptionist', 'dentist']),
    patientController.findAllByKey
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
router.post(
    '/:id/alert',
    authorize(['admin', 'dentist']),
    healthAlertController.create
)

router.get(
    '/alert',
    authorize(['admin', 'dentist']),
    healthAlertController.findAll
)
router.get(
    '/alert/:id',
    authorize(['admin', 'dentist']),
    healthAlertController.findById
)
router.patch(
    '/alert/:id',
    authorize(['admin', 'dentist']),
    healthAlertController.update
)
router.delete(
    '/alert/:id',
    authorize(['admin', 'dentist']),
    healthAlertController.remove
)

// Odontogram
router.post(
    '/:id/tooth',
    authorize(['admin', 'dentist']),
    toothController.create
)

router.get('/tooth', authorize(['admin', 'dentist']), toothController.findAll)
router.get(
    '/tooth/:id',
    authorize(['admin', 'dentist']),
    toothController.findById
)
router.patch(
    '/tooth/:id',
    authorize(['admin', 'dentist']),
    toothController.update
)
router.delete(
    '/tooth/:id',
    authorize(['admin', 'dentist']),
    toothController.remove
)

// // Clinical notes
router.post(
    '/:id/note',
    authorize(['admin', 'dentist']),
    clinicalNoteController.create
)

router.get(
    '/note',
    authorize(['admin', 'dentist']),
    clinicalNoteController.findAll
)
router.get(
    '/note/:id',
    authorize(['admin', 'dentist']),
    clinicalNoteController.findById
)
router.patch(
    '/note/:id',
    authorize(['admin', 'dentist']),
    clinicalNoteController.update
)
router.delete(
    '/note/:id',
    authorize(['admin', 'dentist']),
    clinicalNoteController.remove
)

// // Files
router.post(
    '/:id/file',
    authorize(['admin', 'dentist']),
    patientFileController.create
)

router.get(
    '/file',
    authorize(['admin', 'dentist']),
    patientFileController.findAll
)
router.get(
    '/file/:id',
    authorize(['admin', 'dentist']),
    patientFileController.findById
)
router.patch(
    '/file/:id',
    authorize(['admin', 'dentist']),
    patientFileController.update
)
router.delete(
    '/file/:id',
    authorize(['admin', 'dentist']),
    patientFileController.remove
)

// Patient portal
router.get(
    '/:id/alert',
    authorize(['patient']),
    healthAlertController.findByPatient
)
router.get('/:id/tooth', authorize(['patient']), toothController.findByPatient)
router.get(
    '/:id/note',
    authorize(['patient']),
    clinicalNoteController.findByPatient
)
router.get(
    '/:id/file',
    authorize(['patient']),
    patientFileController.findByPatient
)

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
