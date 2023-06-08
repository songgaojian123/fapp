const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');

router.get('/', UserController.get_users);
router.post('/', UserController.create_user);
router.post('/login', UserController.user_login);
router.get('/:id', UserController.get_user);
router.patch('/:id', UserController.update_user);
router.delete('/:id', UserController.delete_user);
router.post('/:id/transactions', UserController.add_transaction);

module.exports = router;
