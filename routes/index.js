var express = require('express');
var router = express.Router();
var auth = require('../helpers/AuthHelper')

const redirectLogin = (req, res, next) => {
  if (!req.session.uid) {
    res.redirect('/login')
  }
  next()
}
const redirectUser = (req, res, next) => {
  if (req.session.uid) {
    res.redirect('/user')
  } else{
    next()
  }
}

router.get('/', redirectLogin, redirectUser, function(req, res, next) {

});


router.get('/login', redirectUser, function(req, res, next) {
    res.render('login');
});

router.post('/login', async function(req, res, next) {
  if (req.body.username && req.body.password) {
    var user = await auth.authenticate(req.body.username, req.body.password, req.app.locals.db)
    if (user) {
      req.session.uid = user._id;
      res.redirect('/user')
    }
  }
    res.render("login")
})

router.get("/sign_up", redirectUser, function(req, res, next){
  res.render("sign_up")
})

router.post('/sign_up', async function(req, res, next) {
  if (req.body.username && req.body.password) {
    var success = await auth.signUpNewUser(req.body.username, req.body.password,req.app.locals.db);
    if (success)
      res.redirect('/login');
    else {
      res.render('sign_up', {"msg":"The Username Is Taken Pick A Unique Username"});
    }
  }
})

router.get('/list_databases', function(req, res, next) {
  req.app.locals.db.listDatabases();
  res.send('<p>listed</p>');
})

router.get('/clean_db', function(req, res, next) {
  req.app.locals.db.clearDb();
  res.send("Cleared");
})

router.get("/list_data", async function(req, res, next) {
  var resp = await req.app.locals.db.listDocuments()
  console.log(resp)
  res.send("success");
})

module.exports = router;
