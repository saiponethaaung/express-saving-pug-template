var express = require('express');
var router = express.Router();

var LedgerController = require('../controllers/ledgerController');

router.get('/', LedgerController.ledger_list_get);
router.get('/create', LedgerController.ledger_create_form_get);
router.post('/create', LedgerController.ledger_create_form_post);

router.get('/:id', LedgerController.ledger_detail_get);

router.get('/:id/entry', LedgerController.ledger_entry_get);
router.post('/:id/entry', LedgerController.ledger_entry_post);

router.get('/:id/entry/:entryid', LedgerController.ledger_entry_update_get);
router.post('/:id/entry/:entryid', LedgerController.ledger_entry_update_post);
router.all('/:id/entry/:entryid/delete', LedgerController.ledger_entry_delete);

module.exports = router;