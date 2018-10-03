var express = require('express');
var router = express.Router();

var Auth = require('../controllers/authController');

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

  if(undefined!==req.session.token) {
    isLogin = true;
  }

  console.log(req.url);

  if(req.url==='/login' || req.url==='/register') {
    
    if(isLogin) {
      res.redirect('/dashboard');
      return;
    }

    next();
    return;
  }

  if(isLogin) {
    next();
    return;
  }

  res.redirect('/login');
  return;
});

router.get('/register', Auth.register_get);
router.post('/register', Auth.register_post);

router.get('/login', Auth.login_get);
router.post('/login', Auth.login_post);

router.get('/dashboard', function(req, res) {
  res.send("welcome to dashboard - "+req.session.token);
});

module.exports = router;
