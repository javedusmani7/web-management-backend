const express = require('express');
const router = express.Router();
const AuthController = require('../controller/user');
const check_auth = require('../middleware/auth-middleware');
const checkPermission = require('../middleware/permission-middleware');


router.post('/login', AuthController.Login);
router.post('/add-user',[check_auth,checkPermission('ADD_USER')], AuthController.AddUser);
router.get('/get-users',[check_auth,checkPermission('VIEW_USER')], AuthController.getUser);
router.get('/permissions/:userId',check_auth,AuthController.GetPermission);
router.get('/get-user/:id',[check_auth,checkPermission('VIEW_USER')], AuthController.getUserById);
router.put('/permissions/:userId',check_auth,AuthController.UserPermission)
router.get('/checkUserId/:userId',check_auth, AuthController.CheckUserId);
router.get('/checkEmail/:email',check_auth, AuthController.CheckEmail);
router.get('/checkNumber/:number',check_auth, AuthController.CheckNumber);
router.post('/user-status',check_auth,AuthController.UserStatus);
router.post('/active-status',check_auth,AuthController.ActiveUser);
router.post('/updatepassword',check_auth,AuthController.UpdatePassword);
router.post('/delete-user',[check_auth,checkPermission('DELETE_USER')], AuthController.DeleteUser);
router.post('/update-user',[check_auth,checkPermission('EDIT_USER')], AuthController.UpdateUser);

module.exports = router;