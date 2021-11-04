require("dotenv").config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require("jsonwebtoken");

const app = express();

const verifyToken = (req, res, next) => {
  // COOKIE PARSER GIVES YOU A .cookies PROP, WE NAMED OUR TOKEN jwt
  let token = req.cookies.jwt;

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err || !decodedUser) {
      return res.render('authe.hbs');
    }
    // ADDS A .user PROP TO REQ FOR TOKEN USER
    req.user = decodedUser;

    next();
  });
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());

app.get("/", (req, res) => {
  verifyToken(req, res, () =>
    res.redirect("game")
  );
});

app.use('/', require('./controllers/authe'));
app.use('/users', verifyToken, require('./controllers/users'));
app.use('/lobby', verifyToken, require('./controllers/lobby'));
app.use('/game', verifyToken, require('./controllers/game'));

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
