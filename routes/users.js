const e = require("express");
var express = require("express");
var router = express.Router();
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
    let data = await user.dashboardData(req.session.uid, req.app.locals.db);
    let formattedTimetable = formatTimetableData(data);
    res.render("user/dashboard", { data: formattedTimetable });
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

function formatTimetableData(data) {
  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let today = new Date();
  let thisWeek = [[]];
  let tdIndex = null;
  let timetable = data.timeTable;
  timetable.forEach((day, index) => {
    if (new Date(day[0].date).toDateString() === today.toDateString()) {
      tdIndex = index;
    }
  });

  for (let j = 0, i = tdIndex; i < tdIndex + 7; i++, j++) {
    if (void 0 === timetable[i]) break;

    thisWeek[j] = timetable[i];
    for (let k = 0; k < 17; k++)
      thisWeek[j][k].dateName = days[(today.getDay() - 1 + j) % 7];
  }
  return thisWeek;
}
module.exports = router;
