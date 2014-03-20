var levelup = require('levelup');
var util = require('util');
var fs = require('fs');

//var sessionsDb = levelup('../db/sessionsDb', { valueEncoding: 'json' });
var sessionsDb = levelup(__dirname + '/sessionsDb', { valueEncoding: 'json' });

function CheckSession(user, cb) {
  sessionsDb.get(user, function (err, value) {
    if (err) {
      return cb('Login', null);
    }
    var last = new Date(value);
    console.log('date = ' + last);
    var diff = new Date(new Date() - last);
    console.log('minutes = ' + diff.getMinutes());
    if (diff.getMinutes() > 5) {
      console.log('session expired');
      return cb(null, 'Login');
    }
    return cb(null, 'ok');
  });
}

function AddSession(user, cb) {
  var sessionDate = new Date();
  sessionsDb.put(user, sessionDate, function (err) {
    if (err) {
      return cb('Error', null);
    }
    return cb(null, 'ok');
  });
}


function UpdateSession(user, cb) {
  var sessionDate = new Date();
  sessionsDb.get(user, function (err, value) {
    if (err) {
      return cb('Db Error', null);
    }
    sessionsDb.put(user, sessionDate, function (err) {
      if (err) {
        return cb('Db error', null);
      }
      return cb(null, 'ok');
    });
  });
}


module.exports = {
  AddSession : AddSession,
  CheckSession : CheckSession,
  UpdateSession : UpdateSession
};
