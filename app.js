
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var users = require('./routes/usersView');
var operatorView = require('./routes/operatorsView');
var http = require('http');
var path = require('path');
var util = require('util');
var userMod  = require('./db/users');
var operators = require('./db/operators');


var app = express();
app.engine('.html', require('ejs').__express);

// all environments
app.set('port', process.env.PORT || 6005);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('iclient'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/logout', function (req, res) {
    res.clearCookie('session');
    res.clearCookie('level');
    return res.render('index', {redirect: "/", title: 'Log In', redirect: '', note: '' });
});

//app.get('/operatorsView', operatorView.operatorsView);
app.get('/operatorsView', function (req, res) {
  res.render('operatorsView', {title: 'Operators', access_level: req.cookies.level});
});

app.get('/usersView', users.usersView);

app.post('/checklogin', function (req, res) {
  console.log('data = ' + util.inspect(req.body));
  userMod.AuthUser(req.body.login.user, req.body.login.password, function (err, result) {
    if (err) {
      console.log('User Not Found');
      return res.render('index', {redirect: req.url, title: 'LogIn', note: "Invalid User/Password"});
      //return res.send('User Not Found');
    }
    console.log('ok');
    res.cookie('session', req.body.login.user);
    res.cookie('level', result.access_level);
    res.render('operatorsView', {title: 'Operators', access_level: result.access_level});
    //res.send(result);
    //return res.redirect('operatorsView');


  });

});



app.get('/operator_seeds', function (req, res) {
  operators.GetOperatorSeeds(function (err, result) {
    console.log(result);
    res.send(result);
  });

});

app.get('/cookietest', function (req, res) {
  if (!req.cookies.session) {
    console.log('No Cookies');
    res.cookie('session', 'JMF');
    res.cookie('level', 'ADMIN');
    res.send('ok');
  } else {
    console.log(req.cookies.session);
    console.log(req.cookies.level);
    res.clearCookie('session');
    res.clearCookie('level');
    res.send('cookie cleared');
  }
});
app.get('/operators', function (req, res) {
  operators.GetOperators(function (err, result) {
    if (err) {
      console.log(err);
      return res.send(401);
    }
    return res.send(result);
  });
});

app.get('/users', function (req, res) {
  userMod.GetUsers(function (err, result) {
    if (err) {
      console.log(err);
      return res.send(401);
    }
    return res.send(result);
  });
});


app.post('/user_maint', function (req, res) {
  if (req.body.user.operation === 'update') {
    userMod.UpdateUser(req.body, function (err, result) {
      if (!err) {
        return res.render('usersView', {title: 'Users', access_level: req.cookies.level});
      }
    });
  }
  if (req.body.user.operation === 'insert') {
    userMod.AddUser(req.body, function (err, result) {
      if (!err) {
        return res.render('usersView', {title: 'Users', access_level: req.cookies.level});
      }

    });
  }
});

app.post('/operator_maint', function (req, res) {

  if (req.body.operator.operation === 'update') {
    operators.UpdateOperator(req.body, function (err, result) {
      if (err) {
        return res.render('operatorsView', {title: 'Operators', access_level: result.access_level});
      }
      return res.render('operatorsView', {title: 'Operators', access_level: req.cookies.level});
    });
  }

  if(req.body.operator.operation === 'add') {
    operators.AddOperator(req.body, function (err, result) {
      if (err) {
        return res.render('operatorsView', {title: 'Operators', access_level: req.cookies.level});
      }
      return res.render('operatorsView', {title: 'Operators', access_level: req.cookies.level});
    });
  }

  console.log(util.inspect(req.body));
//  return res.send(200);
});


http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
