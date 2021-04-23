var express = require('express');
var router = express.Router();
var auth = require('../helpers/AuthHelper')
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
    user = auth.authenticate(req.body.username, req.body.password, req.app.locals.db)
    if (user) {
      req.session.sessid = user;
      res.redirect("/user/");
    }

    res.redirect("/login")
  }
  
})

router.get("/sign_up", function(req, res, next){
  res.render("sign_up")
})

router.post('/sign_up', function(req, res, next) {
  if (req.body.username && req.body.password) {
    auth.signUpNewUser(req.body.username, req.body.password,req.app.locals.db);
    res.redirect('/login')
  }
})

router.get('/list_databases', function(req, res, next) {
  req.app.locals.db.listDatabases();
  res.send('<p>listed</p>');
})

module.exports = router;
