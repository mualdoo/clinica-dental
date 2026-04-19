import { Router } from 'express'
const router = Router()
import {
    register,
    login,
    refreshToken,
    logout,
    verifyPatientAccount,
    getInfo,
} from '../controllers/user-controller.js'

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshToken)
router.post('/logout', logout)
router.patch('/verify-patient-account', verifyPatientAccount)

// Only accessed by agenda-service
router.get('/user-info/:id', getInfo)

export default router
