var Ledger = require('../models/ledger');
var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.ledger_list_get = function(req, res, next) {
    async.parallel({
        ledgerList: function(callback) {
            Ledger.find({ participent: req.userId })
                .exec(callback);
        }
    }, function(err, results) {
        if(err) { return next(err); }

        res.render('page/ledger/list', { title: 'Ledger List', ledgerLists: results.ledgerList});
    });
};

exports.ledger_create_form_get = function(req, res, next) {
    res.render('page/ledger/form', { title: 'Create ledger' });
};

exports.ledger_create_form_post = [
    body('name', 'Ledger name is required').isLength({min: 1}).trim(),
    sanitizeBody('name').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            ledgerCreateResponse(res, req.body, errors.array());
            return;
        }

        var ledger = new Ledger({
            name: req.body.name,
            owner: req.userId,
            participent: [req.userId]
        });

        ledger.save(function(err) {
            if(err) { return next(err); }

            res.redirect('/ledger');
        });
    }
];

function ledgerCreateResponse(res, user, errors) {
    res.render('page/ledger/form', { title: 'Create ledger', user: user, errors: errors});
}

exports.ledger_entry_post = [

];

exports.ledger_entry_update_get = function(req, res, next) {

};

exports.ledger_entry_update_post = [

];