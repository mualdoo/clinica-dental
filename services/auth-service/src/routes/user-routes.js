import { Router } from 'express'
const router = Router()
import * as controller from '../controllers/user-controller.js'
import { authorize } from '../middleware/role-check.js'
import { verifyInternalKey } from '../middleware/internal.js'

router.post('/register', controller.registerPatient)
router.post('/login', controller.login)
router.post('/refresh', controller.refreshToken)
router.post('/logout', controller.logout)

router.post('/verify-patient-account', controller.verifyPatientAccount)

router.post(
    '/admin/register-user',
    authorize(['admin']),
    controller.registerUser
)

router.get(
    '/dentist/search',
    authorize(['admin', 'receptionist']),
    controller.findDentistByKey
)

router.get('/user', authorize(['admin', 'receptionist']), controller.getUsers)

// Only accessed by agenda/patient-service
router.get('/user-info/:id', verifyInternalKey, controller.getInfo)

export default router
