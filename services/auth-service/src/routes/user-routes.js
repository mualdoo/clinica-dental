import { Router } from 'express';
const router = Router();
import { login, register, verifyPatientAccount } from '../controllers/user-controller.js';

router.post('/login', login);
router.post('/register', register);
router.patch('/verify-patient-account', verifyPatientAccount);

export default router;