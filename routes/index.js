var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.get('/data', function(req, res, next) {
  res.render('data', { title: 'Express' });
});

router.get('/manage', function(req, res, next) {
  res.render('manage', { title: 'Express' });
});

module.exports = router;
