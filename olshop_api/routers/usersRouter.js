const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { readToken } = require('../helper/readToken');

router.get('/', usersController.getUsers);
router.get('/getUser/:iduser', usersController.getUserById);
router.get('/keep', readToken, usersController.keep);
router.delete('/delete/:iduser', usersController.deleteUser);
router.post('/', usersController.registerUser);
router.patch('/verification/', readToken, usersController.verification);
router.patch('/upload-photo', readToken, usersController.uploadPhoto);
router.post('/login/', usersController.loginUser);
router.post('/sendEmailResetPassword', usersController.sendEmailResetPassword);
router.patch('/resetPassword/', usersController.resetPassword);

module.exports = router;
