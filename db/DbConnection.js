var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;

function DbConnectCallback(error, results) {}

var config = {
  userName: 'M3tech!@sifne67iyi',
  password: 'r@fdM3Al!',
  server: 'sifne67iyi.database.windows.net',
  tdsVersion: '7_2',
  options: {
    encrypt: true,
    database: 'm3_Fed_Root'
        //     debug: {
        //        packet:  true,
        //        data:    true,
        //        payload: true,
        //        log:     true 
        // }
  }
};


var poolConfig = {
  min: 1,
  max: 5,
  idleTimeoutMillis: 10000
};


var pool = new ConnectionPool(poolConfig, config);
var pool1 = new ConnectionPool(poolConfig, config);

function GetDbConnection(DbConnectCallback) {
  pool.requestConnection(function (err, connection) {
    if (err) {
      return DbConnectCallback(err, null);
    }
      //console.log('connected from pool');
    connection.on('connect', function (err) {
      if (err) {
        return DbConnectCallback(err, null);
      }
      return DbConnectCallback(null, connection);
    });

    connection.on('end', function (err) {
         //console.log('Connection closed') ;
    });
  });
}
exports.GetDbConnection = GetDbConnection;

 function GetFederatedDbConnection(operatorid,DbConnectCallback) {
   var sql;
   pool1.requestConnection(function (err, connection) {
         
        if(err) {
          DbConnectCallback(err,null);
        } else {
          //console.log('connected from pool');
            if (operatorid > 0) {
              sql = 'use federation [OperatorFederation] ([OperatorID]=' + operatorid + ') with reset,filtering=on';
            }
            else {
             sql = 'use federation [OperatorFederation] ([OperatorID]=' + operatorid + ') with reset,filtering=off';
           }
           //            var request = new Request('use federation [OperatorFederation] ([OperatorID]=' + operatorid + ') with reset,filtering=on', function(err, rowCount) {
            var request = new Request(sql, function(err, rowCount) {
            if(err) {
               console.log('Federation error: ' + err);
               DbConnectCallback(err,null);
            } else {
           //      console.log('changed fed');
                 //delete request;
                 DbConnectCallback(null,connection);


            }
     });

             connection.on('connect', function(err) {
             connection.execSqlBatch(request);
         });

         connection.on('end', function(err){
             console.log('Connection closed') ;
         });

              

        }





    });



 }
 exports.GetFederatedDbConnection = GetFederatedDbConnection;
