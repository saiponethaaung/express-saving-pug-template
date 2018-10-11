var Ledger = require('../models/ledger');
var Record = require('../models/records');
var mongoose = require('mongoose');
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

exports.ledger_detail_get = function(req, res, next) {
    async.parallel({
        ledger: function(callback){
            Ledger.findById(req.params.id)
                .exec(callback);
        },
        entries: function(callback) {
            Record.find({ledger: req.params.id})
                .sort({'createdAt': -1})
                .exec(callback);
        },
        income: function(callback) {
            Record.aggregate([
                {
                    $match: {
                        ledger: new mongoose.Types.ObjectId(req.params.id),
                        credit: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: { $sum: "$amount" }
                    }
                }
            ]).exec(callback);
        },
        expense: function(callback) {
            Record.aggregate([
                {
                    $match: {
                        ledger: new mongoose.Types.ObjectId(req.params.id),
                        credit: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: { $sum: "$amount" }
                    }
                }
            ]).exec(callback);
        }
    }, function(err, results) {
        if(err) { return next(err); }

        console.log('records', results.income)

        res.render('page/ledger/detail', {
            title: `${results.ledger.name} info`,
            ledger: results.ledger,
            entries: results.entries,
            income: undefined!==results.income[0].amount ? results.income[0].amount : 0,
            expense: undefined!==results.expense[0].amount ? results.expense[0].amount : 0
        });
    });
}

exports.ledger_entry_get = function(req, res, next) {
    async.parallel({
        ledger: function(callback) {
            Ledger.findById(req.params.id)
                .exec(callback);
        }
    }, function(err, results) {
        if(err) { return next(err); }

        if(results.ledger.length===0) {
            res.redirect('/ledger');
            return;
        }

        res.render('page/ledger/entry', { title: `${results.ledger.name} Entry`, ledger: results.ledger})
    });
}

exports.ledger_entry_post = [
    body('name', 'Entry name is required!').isLength({min: 1}).trim(),
    body('amount', 'Amount is required!').isLength({min: 1}).trim(),
    body('isCredit', 'Check whatever it\'s credit or not!').isIn([true, false]).trim(),
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        const error = validationResult(req);

        async.parallel({
            ledger: function(callback) {
                Ledger.findById(req.params.id)
                    .exec(callback);
            }
        }, function(err, results) {
            if(err) { return next(err); }
    
            if(results.ledger.length===0) {
                res.redirect('/ledger');
                return;
            }

            var record = new Record({
                ledger: req.params.id,
                name: req.body.name,
                amount: req.body.amount,
                note: req.body.note,
                credit: req.body.isCredit=="true" ? true : false,
                entryBy: req.userId
            });
    
            if(!error.isEmpty) {
                res.render('page/ledger/entry', { title: `${results.ledger.name} Entry`, ledger: results.ledger, entry: record});
                return;
            }
            
            record.save(function(err) {
                if(err) { return next(err); }
                
                res.redirect(results.ledger.url);
                return;
            });
        });

    }
];

exports.ledger_entry_update_get = function(req, res, next) {

};

exports.ledger_entry_update_post = [

];