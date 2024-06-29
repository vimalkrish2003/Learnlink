var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('express-flash');
const session = require('express-session');
const { connect, disconnect } = require('./database/connection');
const MongoStore = require('connect-mongo');
require('dotenv').config();
//Router Require
var intro = require('./routes/introRouter');
var homePageRouter = require('./routes/homePageRouter');
const passport = require('passport');

var app = express();

// Set port to 4000
const port = process.env.PORT || 4000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());

app.use(session({
  secret: process.env.SESSION_SECRET || 'ThakidaThakidaChristy', 
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.DB_URI ,dbName:process.env.DB_NAME}), 
  cookie: {
    secure: false, // Set secure to true in production
    maxAge: 60000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Router Use
app.use('/', intro.router);
app.use('/in', homePageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, async() => {
  await connect();
  console.log(`Server is running on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnect();
  process.exit(0);
});

module.exports = app;