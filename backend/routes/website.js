const express = require('express');
const router = express.Router();
const WebsiteController = require('../controller/webiste');
const check_auth = require('../middleware/auth-middleware');
const checkPermission = require('../middleware/permission-middleware');

router.post('/add-website',[check_auth,checkPermission('ADD_WEBSITE')], WebsiteController.AddWebsite);
router.post('/getPanel',check_auth, WebsiteController.PanelByCustomer);
router.get('/get-website',check_auth, WebsiteController.GetWebsite);
router.post('/website-mother',[check_auth,checkPermission('ADD_WEBSITE')], WebsiteController.WebsiteByMother);
router.get('/website-detail/:id',[check_auth,checkPermission('VIEW_WEBSITE')], WebsiteController.WebsiteDetail);
router.post('/update-website',[check_auth,checkPermission('EDIT_WEBSITE')], WebsiteController.UpdateWebsite);
module.exports = router;