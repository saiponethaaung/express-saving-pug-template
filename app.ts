import express = require('express')
import path = require('path')
import createError = require('http-errors')
import cookieParser = require('cookie-parser')
import logger = require('morgan')
import sassMiddleware = require('node-sass-middleware')
import session = require('express-session')

const app: express.Application = express()

// Database connection setup
import mongoose = require('mongoose')
const mongoDB = 'mongodb://127.0.0.1/saving'

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
mongoose.set('userCreateIndex', true)
mongoose.Promise = global.Promise

const db: mongoose.Connection = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(session({
  secret: 'eW91IHNoYWxsIG5vdCBwYXNz',
  resave: true,
  saveUninitialized: true
}))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}))
app.use(express.static(path.join(__dirname, 'public')))

const router = require('./routes/index');
// var indexRouter = require('./routes/index');


app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: createError.HttpError, req: express.Request, res: express.Response, next: express.NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
