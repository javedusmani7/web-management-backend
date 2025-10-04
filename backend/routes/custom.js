const express = require('express');
const router = express.Router();
const CustomController = require('../controller/custom');
const check_auth = require('../middleware/auth-middleware');
const checkPermission = require('../middleware/permission-middleware');

// Customer ROutes
router.get('/customer-list',[check_auth,checkPermission('VIEW_CUST')], CustomController.CustomerList);
router.post('/add-customer',[check_auth,checkPermission('ADD_CUST')], CustomController.AddCustomer);
router.get('/checkcustomer/:name',check_auth, CustomController.CheckCustomer);
router.post('/update-cust',[check_auth,checkPermission('EDIT_CUST')], CustomController.UpdateCustomer);
router.post('/delete-cust',[check_auth,checkPermission('DELETE_CUST')], CustomController.DeleteCustomer);

// MotherPanel Routes
router.get('/panel-list',[check_auth,checkPermission('VIEW_PANEL')], CustomController.PanelList);
router.post('/add-panel',[check_auth,checkPermission('ADD_PANEL')], CustomController.AddPanel);
router.get('/checkpanel/:panel',check_auth, CustomController.CheckPanel);
router.post('/update-panel',[check_auth,checkPermission('EDIT_PANEL')], CustomController.UpdatePanel);
router.post('/delete-panel',[check_auth,checkPermission('DELETE_PANEL')], CustomController.DeletePanel);


router.get('/getLogs', [check_auth,checkPermission('VIEW_STATEMENT')], CustomController.getLogs);
router.get('/getLog/:userId', check_auth, CustomController.UserLog);

module.exports = router;