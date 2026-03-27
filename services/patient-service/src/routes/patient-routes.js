const router = require('express').Router();
const patientController = require('../controllers/patient-controller');
const alertController = require('../controllers/alert-controller');
const toothController = require('../controllers/tooth-controller');

// Basic patient routes
router.get('/', patientController.findAll);
router.get('/:id', patientController.findById);
router.post('/', patientController.create);
router.patch('/:id', patientController.update);
router.delete('/:id', patientController.remove);

// Health alerts
router.get('/:id/alert', alertController.findAll);
router.get('/:id/alert/:alertId', alertController.findById);
router.post('/:id/alert', alertController.create);
router.patch('/:id/alert/:alertId', alertController.update);
router.delete('/:id/alert/:alertId', alertController.remove);

// Odontogram
router.get('/:id/tooth', toothController.findAll);
router.get('/:id/tooth/:toothId', toothController.findById);
router.get('/:id/tooth/number/:toothNumber', toothController.findByNumber);
router.post('/:id/tooth', toothController.create);
router.patch('/:id/tooth/:toothId', toothController.update);
router.delete('/:id/tooth/:toothId', toothController.remove);

// Files

// Clinical notes

module.exports = router;