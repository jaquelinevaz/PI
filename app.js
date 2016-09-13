var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db=require("./couch");
var app = express();

// put passport config after this line


// passport initialization
app.use(session({
  secret: 'piSecret',
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.serializeUser(function(user, done) {
  console.log("serializeUser")
  console.log(user)
  done(null, user);
});

passport.deserializeUser(function(userObj, done) {
  // query the current user from database
  console.log("deserializeUser")
  console.log(userObj)
  db.select("users","",function(user){
    var res=user[userObj.email]

      if(res!=undefined && res.email==userObj.email)
        done(null, userObj.email);
    },'seriesdb')
  })

passport.use(new LocalStrategy({
      // set the field name here
      usernameField: 'email',
      passwordField: 'password'
    },
    function(username, password, done) {
      /* get the username and password from the input arguments of the function */

      // query the user from the database
      // don't care the way I query from database, you can use
      // any method to query the user from database
      console.log("Passport")
      console.log(password)
      console.log(username)


      db.select("users","",function(user){

        console.log("In select- Password")

        console.log(user)

        var obj=user[username]

       if(obj!=undefined && obj.email==username && obj.password==password) {
         console.log("Is OK ")
         return done(null, obj);
       }
        console.log(" no MATcH")

        return done(null, false, {message: "Wrong password"});

      },'seriesdb')

    }
));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
