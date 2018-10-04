var Ledger = require('../models/ledger');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.ledger_list_get = function(req, res, next) {
    console.log('req.userId', req.userId);
    res.send("ledger list");
};

exports.ledger_create_form_get = function(req, res, next) {

};

exports.ledger_create_form_post = [
    
];

exports.ledger_entry_post = [

];

exports.ledger_entry_update_get = function(req, res, next) {

};

exports.ledger_entry_update_post = [

];