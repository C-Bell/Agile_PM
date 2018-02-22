const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

// Route Imports -
const api = require('./routes/api');
const web = require('./routes/web');

mongoose.connect('mongodb://localhost/myappdatabase');

// Session Management Collection
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
  collection: 'mySessions',
});

// Store Error Listener
store.on('error', (error) => {
  console.log(error);
});

const app = express();

app.use(require('express-session')({
  secret: 'g539ugh45g9-uij45g',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
  store,
  resave: true,
  saveUninitialized: true,
}));


// View Engine Setup
app.set('views', path.join(__dirname, 'views')); // Setting path to views folder
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars'); // Setting view engine to Handlebars

// Add our website favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Logger provides in-depth Logs of how your routes are being accessed
app.use(logger('dev'));
// We want our app to automatically parse for JSON, so we use the JSON bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api);

app.use('/', web);

// Anything which hasn't hit a route by now does not exist, so render a 404
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(err);
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// What Port should we be listening on:
app.listen(3001);

module.exports = app;
