const express = require('express');
const router = express.Router();
const AccountController = require('../controller/account');
const check_auth = require('../middleware/auth-middleware');
const checkPermission = require('../middleware/permission-middleware');


router.post('/add-account',[check_auth,checkPermission('ADD_ACCOUNT')],AccountController.AddAccount);
router.get('/account-list/:type',[check_auth,checkPermission('VIEW_ACCOUNT')], AccountController.AccountList)
router.get('/all-account',check_auth, AccountController.GetAllAccount);
router.post('/update-account',[check_auth,checkPermission('EDIT_ACCOUNT')], AccountController.UpdateAccount);
router.post('/delete-account',[check_auth,checkPermission('DELETE_ACCOUNT')], AccountController.DeleteAccount);

// Other Accounts

router.post('/addotherAccount',[check_auth,checkPermission('ADD_ACCOUNT')],AccountController.AddMasterAccount);
router.get('/master-account-list',[check_auth,checkPermission('VIEW_ACCOUNT')], AccountController.MasterAccountList);
router.post('/update-master',[check_auth,checkPermission('EDIT_ACCOUNT')], AccountController.UpdateMasterAccount);
router.post('/delete-master-account',[check_auth,checkPermission('DELETE_ACCOUNT')], AccountController.DeleteMasterAccount);


// Agent Account

router.post('/addagentAccount',[check_auth,checkPermission('ADD_ACCOUNT')],AccountController.AddAgentAccount);
router.get('/agent-account-list',[check_auth,checkPermission('VIEW_ACCOUNT')], AccountController.AgentAccountList);

module.exports = router;