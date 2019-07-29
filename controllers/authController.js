var User = require('../models/user');
var async = require('async');

var bcrypt = require('bcrypt-nodejs');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.login_get = function(req, res) {
    res.render('page/auth/login', { title: 'Login' });
}

exports.login_post = [
    //Validate email
    body('email', 'Email is required!').isLength({ min: 1 }).trim().isEmail().withMessage('Invalid email address!'),
    // Validate password
    body('password', 'Password is required!').isLength({ min: 1 }),
    // Sanitize email
    sanitizeBody('email').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            loginResponse(res, req.body, errors.array());
            return;
        }

        async.parallel({
            user: function(callback) {
                User.findOne({ email: req.body.email})
                    .exec(callback);
            }
        }, function(err, results) {
            if(err) { return next(err); }

            if(results.user==null || results.user.length>0) {
                loginResponse(res, req.body, [{msg: "Invalid email address or password!"}]);
                return;
            }

            if(bcrypt.compareSync(req.body.password, results.user.password)===false) {
                loginResponse(res, req.body, [{msg: "Invalid email address or password!"}]);
                return;
            }

            req.session.token = bcrypt.hashSync(JSON.stringify(results.user));
            req.session.info = results.user;
            res.redirect('/dashboard');
        });
    }
];

function loginResponse(res, user, errors) {
    res.render('page/auth/login', { title: 'Login', user: user, errors: errors});
}

exports.register_get = function(req, res) {
    res.render('page/auth/register', { title: 'Register' });
}

exports.register_post = [
    // Validate name
    body('name', 'Full name must be between 3 - 100 character.').isLength({ min: 3 }).trim(),
    // Validate username
    body('username', 'Username is required!').isLength({ min: 1 }).trim(),
    // Validate email
    body('email', 'Email is required!').isLength({ min: 1 }).trim().isEmail().withMessage('Invalid email address!'),
    // Validate password
    body('password', 'Password must be 8 character long for minimum!').isLength({ min: 8 }),
    // Sanitize name, username and email
    sanitizeBody('name').trim().escape(),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('email').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        
        // Check validation failed
        if(!errors.isEmpty()) {
            reigsterResponse(res, req.body, errors.array());
            return;
        }

        async.parallel({
            username: function(callback) {
                User.count({ username: req.body.name })
                    .exec(callback);
            },
            email: function(callback) {
                User.count({ email: req.body.email })
                    .exec(callback);
            }
        }, function(err, results) {
            // redirect to error handler if mongoose failed
            if(err) { return next(err); }

            // return error if username is already exists
            if(results.username>0) {
                reigsterResponse(res, req.body, [{msg: 'Username is already taken!'}]);
                return;
            }

            // return error if email is already exists
            if(results.email>0) {
                reigsterResponse(res, req.body, [{msg: 'Email is already taken!'}]);
                return;
            }

            // Prepare user info
            var user = new User({
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password)
            });

            // Save user info
            user.save(function(err) {
                // redirect to error handler if mongoose failed
                if(err) { return next(err); }

                // Send confirmation email and show message
                res.send("Registartion success. Check your email for email confirmation!");
                return;
            });
        });
    }
];

function reigsterResponse(res, user, errors) {
    res.render('page/auth/register', { title: 'Register', user: user, errors: errors});
}