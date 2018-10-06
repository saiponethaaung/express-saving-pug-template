var express = require('express');
var router = express.Router();

var LedgerController = require('../controllers/ledgerController');

router.get('/', LedgerController.ledger_list_get);
router.get('/create', LedgerController.ledger_create_form_get);
router.post('/create', LedgerController.ledger_create_form_post);

module.exports = router;