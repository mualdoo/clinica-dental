const router = require('express').Router();
const controller = require('../controllers/user-controller');

router.post('/login', controller.login);
router.post('/register', controller.register);
router.patch('/verify-patient-account', controller.verifyPatientAccount);

module.exports = router;