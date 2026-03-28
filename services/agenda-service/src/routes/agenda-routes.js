const router = require('express').Router();
const cubicleController = require('../controllers/cubicle-controller');
const appointmentController = require('../controllers/appointment-controller');

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

module.exports = router;