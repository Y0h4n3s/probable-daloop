var router = module.exports = require('express').Router();
const auth = require('../helpers/AuthHelper')
const user = require('../helpers/UserHelper')


const redirectLogin = (req, res, next) => {
  if(!req.session.uid) {
    res.status(401).json({"msg": "You Need to Login First"})
  } else {
    next()
  }
}

const redirectSetup = async (req, res, next) => {
  if(!await user.isSetup(req.session.uid, req.app.locals.db)) {
    res.status(303).json({"msg": "You Need to Setup Your Account First"})
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

router.get("/user/dashboard", redirectLogin, redirectSetup, async (req, res) => {
    res.status(201).json(await user.dashboardData(req.session.uid, req.app.locals.db))
})


router.get("/user/courses", redirectLogin, redirectSetup, async (req, res) => {
  res.status(201).json((await user.dashboardData(req.session.uid, req.app.locals.db)).courses)
})

router.get("/user/tasks", redirectLogin, redirectSetup, async (req, res) => {
  res.status(201).json((await user.dashboardData(req.session.uid, req.app.locals.db)).timeTable)
})

router.post("/user/addtask", redirectLogin, redirectSetup, async(req, res) => {
  const {taskName, priority = 2, difficulty = 2, courseCode, dueDate} = req.body
  if (
    void 0 === taskName ||
    void 0 === courseCode ||
    void 0 === dueDate) {
      res.status(400).send({msg: "Missing Required Parameters"})
    }
  var timetable = (await user.dashboardData(req.session.uid, req.app.locals.db)).timeTable 
  var todaysIndex = getTodaysIndex(timetable)
  for (var i = todaysIndex,j = difficulty; i < timetable.length; i++) {
    if (j < 0) break
    for (var frame of timetable[i]) {
      if (j < 0) break
      if (frame.task.priority < priority && frame.task.open) {
        frame.task.taskName = taskName
        frame.task.priority = priority
        frame.task.difficulty = difficulty
        frame.task.open = false
        frame.task.courseCode = courseCode
        console.log(frame)
        j--
      }
    }
  }
  const updatedTable = await user.updateTimetable(req.session.uid, timetable, req.app.locals.db);
  res.json(updatedTable)
})

function getTodaysIndex(timetable) {
  var startingSize = timetable.length
  var today = new Date();
  timetable.filter(day => new Date(day[0].date) > today)
  return startingSize - timetable.length
}
