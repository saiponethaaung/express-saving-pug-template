var express = require('express');
var router = express.Router();

var Auth = require('../controllers/authController');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Saving' });
});

router.get('/register', Auth.register_get);
router.post('/register', Auth.register_post);

module.exports = router;
