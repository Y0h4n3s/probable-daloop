const e = require("express");
var express = require("express");
var router = express.Router();
var moment = require('moment')
var user = require("../helpers/UserHelper");
/* GET users listing. */

const redirectLogin = async (req, res, next) => {
  if (!req.session.uid) {
    res.redirect("../");
  } else {
    next();
  }
};
const redirectHome = async (req, res, next) => {
  if (await user.isSetup(req.session.uid, req.app.locals.db)) {
    res.redirect("/user/dashboard");
  } else {
    next();
  }
};

const redirectSetup = async (req, res, next) => {
  if (!(await user.isSetup(req.session.uid, req.app.locals.db))) {
    res.redirect("/user/setup");
  } else {
    next();
  }
};
router.get(
  "/",
  redirectLogin,
  redirectSetup,
  redirectHome,
  async function (req, res, next) {}
);

router.get(
  "/dashboard",
  redirectLogin,
  redirectSetup,
  async function (req, res) {
    var data = await user.dashboardData(req.session.uid, req.app.locals.db);
    var formattedTimetable = formatTimetableData(data);
    if (!formattedTimetable) {
      res.json({msg: "An Error Occured While Loading Timetable"})
    } else {
      res.render("user/dashboard", { data: formattedTimetable });
    }
  }
);

router.get("/setup", redirectLogin, redirectHome, function (req, res) {
  res.render("user/setup_courses", {
    stepNo: req.body.stepNo == null ? 1 : req.body.stepNo,
    minDate: new Date().toJSON().slice(0, 10),
  });
});

router.post("/setup", redirectLogin, redirectHome, async function (req, res) {
  await req.app.locals.db.initialSetup(req.session.uid, req.body, (result) => {
    res.redirect("/user/dashboard");
  });
});

router.post("/addtask", redirectLogin, redirectSetup, async (req, res) => {});


// pagination by one week from today
function formatTimetableData(data, tdIndex = null) {
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let today = moment(new Date().toLocaleDateString().replace(/\//g, '-'), "MM-DD-YYYY")
  let thisWeek = [[]];
  
  let timetable = data.timeTable;
  // get todays index from the timetable if it is not provided as argument
  if (tdIndex === null) {
    if (moment(timetable[0][0].date.slice(0, 10)).dayOfYear() > today.dayOfYear()) {
      tdIndex = 0;
    } else {
  for(var [index, day] of timetable.entries()) {
    if (moment(day[0].date.slice(0, 10)).dayOfYear() == today.dayOfYear()) {
      tdIndex = index;
      break;
    }
  }
}
}
if (tdIndex === null) {
  return null;
}
  // grab one week starting from todays index from the timetable
  for (let j = 0, i = tdIndex; i < tdIndex + 7; i++, j++) {
    //stop if the day is past the timetable
    if (void 0 === timetable[i]) break;

    thisWeek[j] = timetable[i];
    for (let k = 0; k < 17; k++)
      thisWeek[j][k].dateName = moment(thisWeek[j][k].date.slice(0,10)).format('dddd');
  }
  return thisWeek;
}
module.exports = router;
