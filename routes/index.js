var express = require('express');
var router = express.Router();
var auth = require('../helpers/AuthHelper')
var db = {
  1: {username: "yohanes", password: "pass"}
}
/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.cookie.sessid == null) {
    res.redirect('/login/');
  }
  else {
    res.redirect('/user/');
  }

  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  if(req.session.cookie.sessid) {
    res.redirect('/user/');
  }
  res.render('login');
});

router.post('/login', function(req, res, next) {
  if (req.body.username && req.body.password) {
    auth.authenticate(req.body.username, req.body.password, db)
  }
  
})

module.exports = router;
