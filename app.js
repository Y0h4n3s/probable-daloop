var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./helpers/DbHelper');

const {
  MONGODB_URI = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb",
  EXPRESS_COOKIE_SECRET = "shhhhhhhhhh@!!"
} = process.env
async function setupDb() {
  await db.createConnection(MONGODB_URI,  { useUnifiedTopology: true });
}
setupDb().catch(console.error);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api')
var app = express();
app.locals.db = db;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({
  name: "sessid",
  cookie: {
    expires: false
  },
  resave: false,
  saveUninitialized: true,
  secret: EXPRESS_COOKIE_SECRET
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/api', apiRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
