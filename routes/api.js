var router = module.exports = require('express').Router();
var auth = require('../helpers/AuthHelper')
var user = require('../helpers/UserHelper')


const redirectLogin = (req, res, next) => {
  if(!req.session.uid) {
    res.status(401).json({"msg": "You Need to Login First"})
  } else {
    next()
  }
}
router.post('/login', async (req, res, next) => {
  var user = {"msg": "Required Parameters username And Password Are Not Set."}
  if (req.body.username && req.body.password) {
    var u = await auth.authenticate(req.body.username, req.body.password, req.app.locals.db)
    if (u) {
      user.msg = "Success"
      user.id = u._id
      req.session.uid = u._id
    } else {
      user.msg = "Incorrect Username Or Password"
    }
  }
  res.json(user)
})

router.post('/sign_up', async (req, res, next) => {
  var user = {"msg": "Required Parameters username And Password Are Not Set."}

  if (req.session.uid) {
    user.msg = "Log Out To Sign Up As A New User"
  }
  else if (req.body.username && req.body.password) {
    var success = await auth.signUpNewUser(req.body.username, req.body.password,req.app.locals.db);
    if (success)
      user.msg = "Success";
    else {
      user.msg = "The Username Is Taken Pick A Unique Username";
    }
  }
    res.json(user)
})

router.post('/user/setup', redirectLogin, async (req, res) => {
  var response = {"msg": "Something Went Wrong Try Again..."}
  if (req.body.timeTable.length == 7 && req.session.uid) { 
    await req.app.locals.db.initialSetup(req.session.uid, req.body, result => {
      if (result.modifiedCount == 1) response.msg = "Successfully Setup"
    })
  }
  res.json(response)
}) 

router.post("/user/dashboard", redirectLogin, async (req, res) => {
    res.status(201).json(await user.dashboardData(req.session.uid, req.app.locals.db))
})