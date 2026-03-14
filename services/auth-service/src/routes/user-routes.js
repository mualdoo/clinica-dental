const router = require('express').Router();
const controller = require('../controllers/user-controller');

router.post('/', controller.addUser);
router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUserById);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;