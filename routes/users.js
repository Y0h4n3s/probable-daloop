var express = require('express');
var router = express.Router();
var user = require('../helpers/UserHelper')
/* GET users listing. */

const redirectHome = (req, res, next) => {
  if (user.isSetup(req.session.sessid, req.app.locals.db)) {
    res.redirect('/dashboard')
  }
  next()
}
router.get('/', function(req, res, next) {
  if (!user.isSetup( req.session.sessid, req.app.locals.db)) {
    res.redirect('/setup')
  }
  else
  res.send("You've logged in successfully with sessid: " + req.session.sessid)
});

router.get('/dashboard', function(req, res,next) {

})

router.get('/setup', redirectHome, function(req, res, next){
  
})
module.exports = router;
