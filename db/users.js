var levelup = require('levelup');
var util = require('util');
var fs = require('fs');
//var usersDb = levelup('./db/usersDb', { valueEncoding: 'json' });
var usersDb = levelup(__dirname + '/usersDb', { valueEncoding: 'json' });


function GetUserTableLayout() {

  var data = {
      cols: {
        UserId: {
          index: 1,
          unique: true,
          type: "string"
        },
        FirstName: {
          index: 2,
          type: "string"
        },
        LastName: {
          index: 3,
          type: "string"
        },

        Password: {
          index: 4,
          type: "string"
        },
        Access: {
          index: 5,
          type: "string"
        }
      },
      rows : [
      ]
    };

  return data;
}





function AuthUser(user, pwd, cb) {
  usersDb.get(user, function (err, value) {
    if (err) {
      //console.log(util.inspect(err));
      return cb('User not found', null);
    }
    if (pwd !== value.password) {
      return cb('Invalid password', null);
    }
    return cb(null, value);
  });
}

function AddUser(data, cb) {
  var userData = {
    user : data.user.userid,
    firstname : data.user.firstname,
    lastname : data.user.lastname,
    access_level : data.user.access,
    password : data.user.password
  };


  usersDb.put(data.user.userid, userData, function (err) {
    if (err) {
      return cb(err, null);
    }
    return cb(null, 'User added');
  });
}

function GetUsers(cb) {
  var users;
  var data = new GetUserTableLayout();
  usersDb.createReadStream()
    .on('data', function (columns) {
      data.rows.push({UserId: columns.value.user,
                     Password: columns.value.password,
                     Access: columns.value.access_level,
                     FirstName: columns.value.firstname,
                     LastName: columns.value.lastname});

    })
    .on('end', function () {
      //console.log('data = ' + util.inspect(data.rows));
      cb(null, data);
    });
}


function UpdateUser(data, cb) {
  usersDb.get(data.user.userid, function (err, value) {
    if (!err) {
      var userData = {
        user : data.user.userid,
        firstname : data.user.firstname,
        lastname : data.user.lastname,
        access_level : data.user.access,
        password : data.user.password
      };

      usersDb.put(data.user.userid, userData, function (err) {
        console.log(err);
        return cb(null, 'ok');
      });
    }
  });
}

function DeleteUser(data, cb) {
  console.log('in deleteuser: ' + data);
  usersDb.del(data, function (err) {
    if (err) {
      console.log('DeleteUser error: ' + err);
      return cb(err,null);
    }

    return cb(null,'ok');

  });  
}



module.exports = {
  AuthUser   : AuthUser,
  AddUser    : AddUser,
  GetUsers   : GetUsers,
  UpdateUser : UpdateUser,
  DeleteUser : DeleteUser
};