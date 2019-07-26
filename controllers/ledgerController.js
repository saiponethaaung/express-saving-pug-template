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

exports.ledger_summary = function(req, res, next) {
    async.parallel({
        ledger: function(callback){
            Ledger.findById(req.params.id)
                .exec(callback);
        },
        entries: function(callback) {
            Record.find({ledger: req.params.id})
                .sort({'entryFor': -1})
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

        let summary = {};

        for(let i of results.entries) {
            let date = new Date(i.createdAt);
            if(undefined==summary[date.getFullYear()]){
                summary[date.getFullYear()] = {
                    year: date.getFullYear(),
                    months: {}
                };
            }
            if(undefined==summary[date.getFullYear()].months[date.getMonth()]){
                summary[date.getFullYear()].months[date.getMonth()] = {
                    sort: date.getMonth(),
                    month: i.created_at_month,
                    amount: {
                        income: 0,
                        expense: 0
                    }
                };
            }

            if(i.credit) {
                summary[date.getFullYear()].months[date.getMonth()].amount.expense += i.amount;
            } else {
                summary[date.getFullYear()].months[date.getMonth()].amount.income += i.amount;
            }
        }

        var sortable = [];
        for (var summaryEntry in summary) {
            sortable.push(summary[summaryEntry]);
        }

        sortable.sort(function(a, b) {
            return a.year < b.year;
        });

        res.render('page/ledger/summary', {
            title: `${results.ledger.name} info`,
            summary: sortable,
            ledger: results.ledger,
            income: results.income.length>0 && undefined!==results.income[0].amount ? results.income[0].amount : 0,
            expense: results.expense.length>0 && undefined!==results.expense[0].amount ? results.expense[0].amount : 0
        });
    });
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
            income: results.income.length>0 && undefined!==results.income[0].amount ? results.income[0].amount : 0,
            expense: results.expense.length>0 && undefined!==results.expense[0].amount ? results.expense[0].amount : 0
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
                entryFor: req.body.entryFor,
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
    async.parallel({
        ledger: function(callback) {
            Ledger.findById(req.params.id)
                .exec(callback);
        },
        entry: function(callback) {
            Record.findById(req.params.entryid)
                .exec(callback);
        }
    }, function(err, results) {
        if(err) { return next(err); }

        res.render('page/ledger/edit', { title: 'Ledger List', entry: results.entry, ledger: results.ledger});
    });
};

exports.ledger_entry_update_post = [
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
            },
            entry: function(callback) {
                Record.findById(req.params.entryid)
                    .exec(callback);
            }
        }, function(err, results) {
            if(err) { return next(err); }
    
            if(results.ledger.length===0) {
                res.redirect('/ledger');
                return;
            }

            if(results.entry.length===0) {
                res.redirect(results.ledger.url);
                return;
            }

            results.entry.name = req.body.name;
            results.entry.amount = req.body.amount;
            results.entry.note = req.body.note;
            results.entry.credit = req.body.isCredit=="true" ? true : false;
            results.entry.entryFor = req.body.entryFor;
            results.entry.entryBy = req.userId;
            
            results.entry.save(function(err) {
                if(err) { return next(err); }
                
                res.redirect(results.ledger.url);
                return;
            });
        });

    }
];

exports.ledger_entry_delete = (req, res, next) => {
    async.parallel({
        ledger: function(callback) {
            Ledger.findById(req.params.id)
                .exec(callback);
        },
        entry: function(callback) {
            Record.findById(req.params.entryid)
                .exec(callback);
        }
    }, function(err, results) {
        if(err) { return next(err); }

        if(results.ledger.length===0) {
            res.redirect('/ledger');
            return;
        }

        if(results.entry.length===0) {
            res.redirect(results.ledger.url);
            return;
        }
              
        results.entry.delete(function(err) {
            if(err) { return next(err); }
            
            res.redirect(results.ledger.url);
            return;
        });
    });

};