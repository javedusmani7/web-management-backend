const express = require('express');
const router = express.Router();
const telegramController = require('../controller/telegram');
const check_auth = require('../middleware/auth-middleware');
const checkPermission = require('../middleware/permission-middleware');

router.post('/add',
    [check_auth,checkPermission('ADD_TELEGRAM')], 
    telegramController.AddTelegram
);

router.get('/lists',
    [check_auth,checkPermission('VIEW_TELEGRAM')], 
    telegramController.TelegramLists
);


router.post('/update',
    [check_auth,checkPermission('EDIT_TELEGRAM')], 
    telegramController.UpdateTelegram
);


module.exports = router;