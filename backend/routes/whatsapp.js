const express = require('express');
const router = express.Router();
const whatsappController = require('../controller/whatsapp');
const check_auth = require('../middleware/auth-middleware');
const checkPermission = require('../middleware/permission-middleware');

router.post('/add',
    [check_auth,checkPermission('ADD_WHATSAPP')], 
    whatsappController.AddWhatsapp
);

router.get('/lists',
    [check_auth,checkPermission('VIEW_WHATSAPP')], 
    whatsappController.WhatsappLists
);


router.post('/update',
    [check_auth,checkPermission('EDIT_WHATSAPP')], 
    whatsappController.UpdateWhatsapp
);


module.exports = router;