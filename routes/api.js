var router = (module.exports = require("express").Router());
const auth = require("../helpers/AuthHelper");
const user = require("../helpers/UserHelper");
const {frames} = require("../helpers/Constants")
const redirectLogin = (req, res, next) => {
  if (!req.session.uid) {
    res.status(401).json({ msg: "You Need to Login First" });
  } else {
    next();
  }
};

const redirectSetup = async (req, res, next) => {
  if (!(await user.isSetup(req.session.uid, req.app.locals.db))) {
    res.status(303).json({ msg: "You Need to Setup Your Account First" });
  } else {
    next();
  }
};
router.post("/login", async (req, res, next) => {
  var user = { msg: "Required Parameters username And Password Are Not Set." };
  if (req.body.username && req.body.password) {
    var u = await auth.authenticate(
      req.body.username,
      req.body.password,
      req.app.locals.db
    );
    if (u) {
      user.msg = "Success";
      user.id = u._id;
      req.session.uid = u._id;
    } else {
      user.msg = "Incorrect Username Or Password";
    }
  }
  res.json(user);
});

router.post("/sign_up", async (req, res, next) => {
  var user = { msg: "Required Parameters username And Password Are Not Set." };

  if (req.session.uid) {
    user.msg = "Log Out To Sign Up As A New User";
  } else if (req.body.username && req.body.password) {
    var success = await auth.signUpNewUser(
      req.body.username,
      req.body.password,
      req.app.locals.db
    );
    if (success) user.msg = "Success";
    else {
      user.msg = "The Username Is Taken Pick A Unique Username";
    }
  }
  res.json(user);
});

router.post("/user/setup", redirectLogin, async (req, res) => {
  var response = { msg: "Something Went Wrong Try Again..." };
  if (req.body.timeTable.length == 7 && req.session.uid) {
    await req.app.locals.db.initialSetup(
      req.session.uid,
      req.body,
      (result) => {
        if (result.modifiedCount == 1) response.msg = "Successfully Setup";
      }
    );
  }
  res.json(response);
});

router.get(
  "/user/dashboard",
  redirectLogin,
  redirectSetup,
  async (req, res) => {
    res
      .status(201)
      .json(await user.dashboardData(req.session.uid, req.app.locals.db));
  }
);

router.get("/user/courses", redirectLogin, redirectSetup, async (req, res) => {
  res
    .status(201)
    .json(
      (await user.dashboardData(req.session.uid, req.app.locals.db)).courses
    );
});

router.get("/user/tasks", redirectLogin, redirectSetup, async (req, res) => {
  res
    .status(201)
    .json(
      (await user.dashboardData(req.session.uid, req.app.locals.db)).timeTable
    );
});

router.post("/user/addtask", redirectLogin, redirectSetup, async (req, res) => {
  const {
    taskName,
    priority = 2,
    difficulty = 2,
    courseCode,
    dueDate,
  } = req.body;
  if (void 0 === taskName || void 0 === courseCode || void 0 === dueDate) {
    res.status(400).send({ msg: "Missing Required Parameters" });
  }
  var data = await user.dashboardData(req.session.uid, req.app.locals.db);
  var timetable = data.timeTable;
  var taskDueDate = new Date(dueDate);
  var daysLeftTillDueDate = dateDiffInDays(new Date(), taskDueDate);
  // values taken at a time
  var shards = [difficulty + 1];
  var freeSlots = countFreeSlots(timetable, difficulty + 1);
  var maxContinuousFreeSlots = max(freeSlots);

  while (max(shards) > 2 || maxContinuousFreeSlots < max(shards)) {
    shards = halfMaxShard(shards);
  }
  shards.sort((a, b) => (a > b ? -1 : b > a ? 1 : 0));
  var todaysIndex = getTodaysIndex(timetable);
  var jumpOffset = calculateJumpOffset(
    daysLeftTillDueDate,
    shards.length,
    freeSlots.reduce((a, b) => a + b)
  );
  var allFrames = timetable.reduce((acc, day) => acc.concat(day));

  for (var shard of shards) {
    for (var [i, frame] of allFrames.entries()) {
      var check = true;
      for (var j = shard; j < i + shard; j++) {
        check = allFrames[j].open;
        if (!check) break;
      }
      if (check) {
        for (var j = shard; j < i + shard; j++) {
          allFrames[j].task.taskName = taskName;
          allFrames[j].task.priority = priority;
          allFrames[j].task.difficulty = difficulty;
          allFrames[j].task.open = false;
          allFrames[j].task.courseCode = courseCode;
        }
        break;
      }
    }
  }
  var timetable = []
  for (var i = 0; i < allFrames.length - frames.length; i+=frames.length) {
    timetable.push(allFrames.splice(i, frames.length))
  }
  console.log({ timetable });
 
  const updatedTable = await user.updateTimetable(
    req.session.uid,
    timetable,
    req.app.locals.db
  );
  res.json(updatedTable);
});

function calculateJumpOffset(daysLeftTillDueDate, numOfShards, totalFreeSlots) {
  var jumpOffset = (daysLeftTillDueDate + totalFreeSlots) / numOfShards;
  return jumpOffset;
}

function halfMaxShard(shards) {
  var maxShard = max(shards);
  var tempShards = Array.from(shards);
  for (var [i, shard] of tempShards.entries()) {
    if (shard == maxShard) {
      shards.splice(
        i,
        1,
        parseInt(shard / 2),
        parseInt(shard / 2) + (shard % 2)
      );
      break;
    }
  }
  return shards;
}

function countFreeSlots(timetable, shard) {
  var counter = 0;
  var slots = [];
  for (var day of timetable) {
    for (var frame of day) {
      if (counter == shard || (!frame.task.open && counter != 0)) {
        slots.push(counter);
        counter = 0;
        continue;
      }
      counter++;
    }
  }
  return slots;
}

function max(arr) {
  return Math.max.apply(Math, arr)
}

function getTodaysIndex(timetable) {
  var startingSize = timetable.length;
  var today = new Date();
  timetable.filter((day) => new Date(day[0].date) > today);
  return startingSize - timetable.length;
}

function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}
