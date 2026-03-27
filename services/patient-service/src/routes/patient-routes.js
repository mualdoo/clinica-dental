const router = require('express').Router();
const patientController = require('../controllers/patient-controller');
const alertController = require('../controllers/alert-controller');
const toothController = require('../controllers/tooth-controller');
const noteController = require('../controllers/note-controller');
const patientFileController = require('../controllers/patient-file-controller');

// Basic patient routes
router.get('/', patientController.findAll);
router.get('/:id', patientController.findById);
router.post('/', patientController.create);
router.patch('/:id', patientController.update);
router.delete('/:id', patientController.remove);

// Health alerts
router.get('/:id/alert', alertController.findAll);
router.get('/:id/alert/:itemId', alertController.findById);
router.post('/:id/alert', alertController.create);
router.patch('/:id/alert/:itemId', alertController.update);
router.delete('/:id/alert/:itemId', alertController.remove);

// Odontogram
router.get('/:id/tooth', toothController.findAll);
router.get('/:id/tooth/:itemId', toothController.findById);
router.get('/:id/tooth/number/:toothNumber', toothController.findByNumber);
router.post('/:id/tooth', toothController.create);
router.patch('/:id/tooth/:itemId', toothController.update);
router.delete('/:id/tooth/:itemId', toothController.remove);

// Clinical notes
router.get('/:id/note', noteController.findAll);
router.get('/:id/note/:itemId', noteController.findById);
router.post('/:id/note', noteController.create);
router.patch('/:id/note/:itemId', noteController.update);
router.delete('/:id/note/:itemId', noteController.remove);

// Files
router.get('/:id/file', patientFileController.findAll);
router.get('/:id/file/:itemId', patientFileController.findById);
router.post('/:id/file', patientFileController.create);
router.patch('/:id/file/:itemId', patientFileController.update);
router.delete('/:id/file/:itemId', patientFileController.remove);

module.exports = router;