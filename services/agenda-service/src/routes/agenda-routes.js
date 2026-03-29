import { Router } from 'express';
const router = Router();
import cubicleController from '../controllers/cubicle-controller.js';
import appointmentController from '../controllers/appointment-controller.js';

// Cubicle
router.get('/cubicle', cubicleController.findAll);
router.get('/cubicle/:id', cubicleController.findById);
router.post('/cubicle', cubicleController.create);
router.patch('/cubicle/:id', cubicleController.update);
router.delete('/cubicle/:id', cubicleController.remove);

// Appointments
router.get('/appointment', appointmentController.findAll);
router.get('/appointment/:id', appointmentController.findById);
router.post('/appointment', appointmentController.create);
router.patch('/appointment/:id', appointmentController.update);
router.delete('/appointment/:id', appointmentController.remove);

export default router;