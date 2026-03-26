const router = require('express').Router();
const controller = require('../controllers/patient-controller');
const toothController = require('../controllers/tooth-controller');
const alertController = require('../controllers/alert-controller');

// Basic patient routes
router.post('/', controller.addPatient);
router.get('/', controller.getAllPatients);
router.get('/:id', controller.getPatientById);
router.patch('/:id', controller.updatePatient);
router.delete('/:id', controller.deletePatient);

// Health alerts
router.post('/:id/alert', alertController.addAlert);
// router.get('/:id/alert', alertController.);
// router.get('/:id/alert/:toothId', alertController.);
// router.patch('/:id/alert/:toothId', alertController.);
// router.delete('/:id/alert/:toothId', alertController.);

// Odontogram
router.post('/:id/tooth', toothController.addTooth);
router.get('/:id/tooth', toothController.getAllTeeth);
router.get('/:id/tooth/:toothId', toothController.getToothById);
router.get('/:id/tooth/number/:toothNumber', toothController.getTeethByNumber);
router.patch('/:id/tooth/:toothId', toothController.updateTooth);
router.delete('/:id/tooth/:toothId', toothController.deleteTooth);

// Files

// Clinical notes

module.exports = router;