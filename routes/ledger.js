var express = require('express');
var router = express.Router();

var LedgetController = require('../controllers/ledgerController');

router.get('/', LedgetController.ledger_list_get);

module.exports = router;