import { Router } from 'express';
const router = Router();
import { login, register, verifyPatientAccount, getInfo } from '../controllers/user-controller.js';

router.post('/login', login);
router.post('/register', register);
router.patch('/verify-patient-account', verifyPatientAccount);

// Only accessed by agenda-service
router.get('/user-info/:id', getInfo);

export default router;