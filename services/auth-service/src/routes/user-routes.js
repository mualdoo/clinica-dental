const router = require('express').Router();
const controller = require('../controllers/user-controller');

router.post('/', controller.addUser);
router.post('/login', controller.login);
router.post('/register', controller.register);
router.post('/create-patient-account', controller.createPatientAccount);
router.patch('/verify-patient-account', controller.verifyPatientAccount);

module.exports = router;