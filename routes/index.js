var express = require('express');
var router = express.Router();
var async = require('async');

var ledgerRoute = require('./ledger');
var Auth = require('../controllers/authController');
var User = require('../models/user');

router.get('/', function(req, res, next) {
    if(req.session.pageview) {
        req.session.pageview++;
    } else {
        req.session.pageview = 1;
    }
    res.render('index', { title: 'Saving', pageview: req.session.pageview });
});

/* GET home page. */
router.all('/*', function(req, res, next) {
    var isLogin = false;
    // Make async call
    async.parallel({
        // Check user exists
        user: function(callback) {
            User.findById(req.session.info ? req.session.info._id : null)
            .exec(callback);
        }
    }, function(err, results) {
        // Return to error page if there is an error
        if(err) { return next(err); }

        // Check user result
        if(results.user===null) {
            isLogin = false;
        } else {
            isLogin = true;
            req.userId = results.user._id;
        }

        // Is home or login or register page
        if(req.url==='/' || req.url==='/login' || req.url==='/register') {
            
            // If user login redirect to dashboard
            if(isLogin) {
                res.redirect('/dashboard');
                return;
            }

            // Continue to form
            next();
            return;
        }

        // Continue to action if user is login
        if(isLogin) {
            next();
            return;
        }

        // Redirect to login page if user is not login
        res.redirect('/login');
        return;
    });
});

router.get('/', function(req, res) {
    res.send(`
        Welcome to my money maker<br/>
        <a href='/login'>Login> | <a href='/register'>Register</a>
    `);
});

router.get('/register', Auth.register_get);
router.post('/register', Auth.register_post);

router.get('/login', Auth.login_get);
router.post('/login', Auth.login_post);

router.get('/dashboard', function(req, res) {
    res.render('page/dashboard', { title: 'Dashboard' });
});

router.use('/ledger', ledgerRoute);

module.exports = router;
