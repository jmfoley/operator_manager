var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var dbConnect = require('./DbConnection');
var util = require('util');
var uuid = require('uuid-lib');
var async = require('async');
var opReport  = require('../reports/OpReport');


function FormatDate( data ) {
  var d = new Date(data);
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  curr_month++;
  var curr_year = d.getFullYear();

  return curr_month + "/" + curr_date + "/" + curr_year;
}

function GetOperatorReportData(operator, startDate, endDate, cb) {
  console.log('in operator report');
  dbConnect.GetDbConnection(function (err, connection) {
    if (err) {
      return cb(null,err);
    }
    var sql = 'select SiteId, RT, VGT, GameDate, Operator_Desc, Site_Desc, Rt_Daily_Cost, Vgt_Daily_Cost from db_Operator_Stats where OperatorId = @oper ' +
              'and GameDate >= @start and GameDate <= @end';
     var data = []; 
     var start = new Date(startDate);
     var end = new Date(endDate);        
    var request = new Request(sql, function (err, results) {
      if (err) {
        console.log(err);
        return cb('Database Error', null);
      }

      if (data.length < 1) {
        return cb('No Data Returned For Date Range', null);
      }
      
      opReport.PrintReport(data, startDate, endDate, function (err, path) {
        if (err) {
          return cb(err, null);
        }
        console.log('path1 = ' + path);
        return cb(null, path);
      });

      //return cb(null, data);

    }); 
    request.on('row', function (columns) {
      data.push({operator: columns[4].value,
                      operatorid: operator,
                      site: columns[5].value,
                      siteid: columns[0].value,
                      date: FormatDate(columns[3].value),
                      rtcount: columns[1].value,
                      vgtcount: columns[2].value,
                      rtcost: columns[6].value,
                      vgtcost: columns[7].value,
                      rttotal: (columns[1].value * columns[6].value),
                      vgttotal: (columns[2].value * columns[7].value) });
                      

    });  
    request.addParameter('oper', TYPES.Int, operator);
    request.addParameter('start', TYPES.DateTime, start);
    request.addParameter('end', TYPES.DateTime, end); 
    connection.execSql(request);        
  });    
}



function AddSlType(connection, operatorId, cb) {
  var sql = 'insert into sl_type( operatorId, manuf_id, type_id, type_desc, multi_gam, num_games, denom, mach_par, manuf_theor_par, ' +
             'point_factor, hopper_amt, fill_amt, readitonly, defaultrec, status, manuf, ratinggrpid, subtractforecast, group_name, ' +
             'ol_lsi_code, eprom_id, custom1, custom2, custom3, custom4, custom5, custom6, custom7, custom8, custom9, custom10, ' +
             'class3, updated, denom_id) values(@oper, \'1\', \'1\', \'UNDEFINED\', 0, 1, .01, 0,0,0,0,0,1,1,\'A\',\'UNDEFINED\', ' +
             '0,1,\'\',\'\',\'\',0,0,0,0,0,\'\',\'\',\'\',\'\',\'\',1,getdate(),1)';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  connection.execSql(request);
}

function AddSlStyle(connection, operatorId, cb) {
  var sql = 'insert into sl_style( operatorId, style_id, style_desc, cabinet, width, depth, height, readitonly, defaultrec,' +
            'status, updated) values(@oper, \'1\', \'UNDEFINED\', \'UNDEFINED\', 1,1,1,1,1,\'A\',getdate()) ' +

            'insert into sl_style( operatorId, style_id, style_desc, cabinet, width, depth, height, readitonly, defaultrec,' +
            'status, updated) values(@oper, \'Sitdown\', \'Sitdown\', \'Sitdown\', 0,0,0,0,0,\'A\',getdate()) ' +

            'insert into sl_style( operatorId, style_id, style_desc, cabinet, width, depth, height, readitonly, defaultrec,' +
            'status, updated) values(@oper, \'Slanttop\', \'Slanttop\', \'Slanttop\', 0,0,0,0,0,\'A\',getdate()) ' +

            'insert into sl_style( operatorId, style_id, style_desc, cabinet, width, depth, height, readitonly, defaultrec,' +
            'status, updated) values(@oper, \'Upright\', \'Upright\', \'upright\', 1,1,1,1,1,\'A\',getdate())';


  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  connection.execSql(request);
}

function AddSlManuf(connection, operatorId, cb) {
  var sql = 'insert into sl_manuf( operatorId, manuf_id, manuf, readitonly, defaultrec, status, updated) values (' +
            '@oper, \'1\',\'UNDEFINED\',0,1,\'A\',getdate() )';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  connection.execSql(request);
}

function AddSlLease(connection, operatorId, cb) {
  var sql = 'insert into sl_lease( operatorId, lease_id, leased_by, lease_date, lease_ends, per_coin, per_win, fee_day, ' +
            'fee_game,readitonly, defaultrec, status, per_coin_max, per_coin_min, per_win_max, per_win_min, updated) values( ' +
            '@oper, \'NO_LEASE\',\'HOUSE MACHINE\',\'1/1/2013\', \'1/1/2020\', 0,0,0,0,1,1,\'A\',-1,-1,-1,-1,getdate())';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  connection.execSql(request);
}

function AddControl(connection, operatorId, cb) {
  var sql = 'insert into control values(@oper, newid(),0,0,0,0,0)';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  connection.execSql(request);

}

function AddScCorpEntities(connection, operatorId, cb) {
  var sql = 'insert into sc_corporateentities(operatorId,casinoident,casinoid,casinodesc,contactname,contactPhone,phone,address,' +
            'city,state,zip,maintenanceRegion,customer,isActive,location,licenseNum) values(@oper, newid(), 0, ' +
            '\'Temp Name\', \'\',\'\',\'\',\'\',\'\',\'\',\'\',null,null,\'True\',null,\'\' )';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  connection.execSql(request);
}


function AddScAssignedMenus(connection, operatorId, cb) {
  var sql = 'insert into sc_assigned_menus( operatorID, assigned_menuid, menu_id, menu_seq, group_id, updated_by, ' +
            'updated, updated_from) select @oper, newid(),menu_id, 0, @groupid, \'Admin\', getdate(), \'Admin01\' ' +
            'from sc_menus';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      console.log(err);
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  request.addParameter('groupID', TYPES.VarChar, 'C9438A39-2AA4-441E-BAD4-1D2471A59F82');
  connection.execSql(request);
}



function AddScUsers(operatorId, cb) {
  dbConnect.GetFederatedDbConnection(0, function (err, connection) {
    if (err) {
      return cb(err, null);
    }
    var sql = 'insert into sc_users( user_id, first_name, last_name, job_title, department_id, user_pwd, groupid, start_form, password_expires, ' +
              'status, updated_by, updated, updated_from, secondary_id, secondary_code, pwdLastChanged,pwdLastChangedBy, pin, ADLogin, pwdHash, pwdSalt, ' +
              'pinSalt, pinHash,operatorID, phone, carrier) values( \'admin\', \'Administrator\',\'\',\'Administrator\', ' +
              'newid(), \'\', @groupID, 0, \'1/1/15\', 0, \'Admin\',\'12/10/13\',\'Admin\', 0,0,\'12/10/13\',\'Admin\',\'\', \'\',' +
              '@pwdHash, @pwdSalt, @pinSalt, @pinHash,@oper,\'\',1)';
    var request = new Request(sql, function (err, sqlResults) {
      if (err) {
        request = null;
        sql = null;
        connection.close();
        return cb(err, null);
      }
      request = null;
      sql = null;
      connection.close();
      return cb();
    });
    request.addParameter('groupID', TYPES.VarChar, 'C9438A39-2AA4-441E-BAD4-1D2471A59F82');
    request.addParameter('pwdHash', TYPES.VarChar, 'yc0SE8QPcj4lqmXieJGAyFaRs7buOwjpP9kU0ldIsDVDDAoI+OZsCf+heRLB6HMGTkrqHLXE5BZVEeFJ5tRVVxKf90JMKSkLlXFSkx3kusv/sN/CeCfWSPNdq2EsVJuSus7IWw7g7ZAOnrVyGnvkuSvkWShTxYWCEnvrfR5uf8M=');
    request.addParameter('pwdSalt', TYPES.VarChar, 'f7B9AfyMrVD2lnJWpTLC9PvTctodK1dwKv/fyMs36UPuacmxHJjeYJH4/Bz7vEue');
    request.addParameter('pinSalt', TYPES.VarChar, 'RBVdrRkf6u6q+gdap6VjVe1BbyB/6Lwkbz+7Mt/KrBq4uWUTj5rMUy6uUurnJd1h');
    request.addParameter('pinHash', TYPES.VarChar, 'xbxcF/vm07bAJkYAeV63DskU4iNLNZSvXNw4MJZur6LAaKLdFyHyg8o8NmYsrCoVJYi9ue7gnedLAOHscE99oeLC76DJGcdb+O3Yk+dBI/8KMkVwJh4OFRR4zI4b8tAkRLscbjOjYQsqmti/xosL/AMQxYkIrDkaDEzd4dBJURA=');
    request.addParameter('oper', TYPES.Int, operatorId);
    connection.execSql(request);
  });
}

function AddScGroups(connection, operatorId, cb) {
  var sql = 'insert into sc_groups(operatorId,group_id,group_desc,updated_by,updated,updated_from,groupGUID,campaignGUID,isTech)values( ' +
            '@oper,@groupID,\'Administration\',\'Admin\',getdate(),\'Admin01\',null,null,\'False\')';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  request.addParameter('groupID', TYPES.VarChar, 'C9438A39-2AA4-441E-BAD4-1D2471A59F82');
  connection.execSql(request);
}

function AddScAssignedForms(connection, operatorId, cb) {
  var sql = 'insert into sc_assigned_forms(operatorID,assigned_formid,form_id,menu_id,form_seq,group_id,updated_by,updated,' +
             'updated_from) select @oper, newid(),form_id,0,0,@group,@updatedby,getdate(),@updatedfrom from cf_forms where ' +
             'form_id > 7000 order by form_id';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb(null, 'ok');
  });
  request.addParameter('oper', TYPES.Int, operatorId);
  request.addParameter('group', TYPES.VarChar, 'C9438A39-2AA4-441E-BAD4-1D2471A59F82');
  request.addParameter('updatedby', TYPES.VarChar, 'Admin');
  request.addParameter('updatedfrom', TYPES.VarChar, 'Admin01');
  connection.execSql(request);
}


function UpdateScAssignedForms(connection, operatorId, cb) {
  var sql = 'update sc_assigned_forms set menu_id = 7100 where form_id > 7100 and form_id < 7200 ' +
            'update sc_assigned_forms set menu_id = 7200 where form_id > 7200 and form_id < 7300 ' +
            'update sc_assigned_forms set menu_id = 7300 where form_id > 7300 and form_id < 7400 ' +
            'update sc_assigned_forms set menu_id = 7400 where form_id > 7400 and form_id < 7500 ' +
            'update sc_assigned_forms set menu_id = 7500 where form_id > 7500 and form_id < 7600 ' +
            'update sc_assigned_forms set menu_id = 7600 where form_id > 7600 and form_id < 7700 ' +
            'update sc_assigned_forms set menu_id = 7700 where form_id > 7700 and form_id < 7800 ' +
            'update sc_assigned_forms set menu_id = 7800 where form_id > 7800 and form_id < 7900';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb(null, 'ok');
  });
  connection.execSql(request);
}

function AddScConfigure(connection, operatorId, cb) {
  var sql = 'insert into sc_configure values (@operatorID, \'BADLOGONS\', \'Maximum bad logon attempts\', \'3\',\'Admin\',getdate(),\'Admin01\')' +
            'insert into sc_configure values (@operatorID, \'CARDALIGN\', \'Player Card Text Alignment\', \'L\',\'Admin\',getdate(),\'Admin01\')' +
            'insert into sc_configure values (@operatorID, \'DROPEND\', \'Drop Window End Time\', \'15:00\',\'Admin\',getdate(),\'Admin01\')' +
            'insert into sc_configure values (@operatorID, \'EOD\', \'End of Gaming Day (HH:MM)\', \'06:00\',\'Admin\',getdate(),\'Admin01\')' +
            'insert into sc_configure values (@operatorID, \'MDMAXCDAMT\', \'Machine Drop Max Amount\', \'999999\',\'Admin\',getdate(),\'Admin01\')' +
            'insert into sc_configure values (@operatorID, \'MDREQBOX#\', \'Machine Drop Box Required\', \'1\',\'Admin\',getdate(),\'Admin01\')' +
            'insert into sc_configure values (@operatorID, \'MDREQCART#\', \'Machine Drop Card Required\', \'1\',\'Admin\',getdate(),\'Admin01\')' +
            'insert into sc_configure values (@operatorID, \'MINPWDLEN\', \'Minimum Password Length\', \'4\',\'Admin\',getdate(),\'Admin01\')' +
            'insert into sc_configure values (@operatorID, \'PWDEXPDAYS\', \'Password Expiration Days\', \'30\',\'Admin\',getdate(),\'Admin01\')';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('operatorID', TYPES.Int, operatorId);
  connection.execSql(request);
}


function AddCfTransTypes(connection, operatorId, cb) {
  var sql = 'insert into cf_transtypes values (@operatorID,0,\'Bill Break\',10000,1) ' +
            'insert into cf_transtypes values (@operatorID,1,\'Voucher Redemption\',50000,1) ' +
            'insert into cf_transtypes values (@operatorID,2,\'ATM Withdrawl\',0,1) ' +
            'insert into cf_transtypes values (@operatorID,3,\'RT Fill\',0,1) ' +
            'insert into cf_transtypes values (@operatorID,4,\'RT Drop\',0,1) ' +
            'insert into cf_transtypes values (@operatorID,5,\'Voucher Batch\',90000,1) ' +
            'insert into cf_transtypes values (@operatorID,6,\'Cash Retrived\',0,1) ' +
            'insert into cf_transtypes values (@operatorID,7,\'Test Cash Dispense\',0,1) ' +
            'insert into cf_transtypes values (@operatorID,8,\'Test Coin Dispense\',0,1) ' +
            'insert into cf_transtypes values (@operatorID,9,\'Change Drawer Draw\',0,1) ' +
            'insert into cf_transtypes values (@operatorID,10,\'Manual Ticket Redemption\',0,1) ';
  var request = new Request(sql, function (err, sqlResults) {
    if (err) {
      request = null;
      sql = null;
      return cb(err, null);
    }
    request = null;
    sql = null;
    return cb();
  });
  request.addParameter('operatorID', TYPES.Int, operatorId);
  connection.execSql(request);
}

function AddScCustomFields(connection, operatorId, cb) {
  var sql = 'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField01\', \'Custom Field 1\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values' +
            '( @operatorID, \'Machine\', \'CustomField02\', \'Custom Field 2\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField03\', \'Custom Field 3\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField04\', \'Custom Field 4\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField05\', \'Custom Field 5\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField06\', \'Custom Field 6\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField07\', \'Custom Field 7\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField08\', \'Custom Field 8\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField09\', \'Custom Field 9\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Machine\', \'CustomField10\', \'Custom Field 10\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
 
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField01\', \'Custom Field 1\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField02\', \'Custom Field 2\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField03\', \'Custom Field 3\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField04\', \'Custom Field 4\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField05\', \'Custom Field 5\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField06\', \'Custom Field 6\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField07\', \'Custom Field 7\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField08\', \'Custom Field 8\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField09\', \'Custom Field 9\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0) ' +
            'insert into sc_customFields( operatorID, tableName, fieldName, fieldDescription, required, masked, updated, updatedBy, updatedFrom, id, status) values ' +
            '( @operatorID, \'Theme\', \'CustomField10\', \'Custom Field 10\', 1, 0, getdate(), \'Admin\', \'Admin01\', newid(), 0)';

  var request = new Request(sql, function (err, result) {
    if (err) {
      sql = null;
      request = null;
      return cb(err, null);
    }

    sql = null;
    request = null;
    return cb(null, result);
  });
  request.addParameter('operatorID', TYPES.Int, operatorId);
  connection.execSql(request);          
}




function AddCfOperators(data, cb) {
  var active = null;
  var welch = null;


  if (typeof data.operator.active === 'undefined') {
    active = false;
  } else {
    active = data.operator.active;
  }

  if (typeof data.operator.welch === 'undefined') {
    welch = false;
  } else {
    welch = data.operator.welch;
  }

 if (isNaN(data.operator.rtcost) ) {
        data.operator.rtcost = '0';
      }
    
      if (isNaN(data.operator.vgtcost) ) {
        data.operator.vgtcost = '0';
      }

  dbConnect.GetDbConnection(function (err, connection) {
    if (err) {
      return cb(err, null);
    }
    var sql = 'insert into cf_Operators(ID,Description,Address,City,State,Zip,Phone,Active,WelchAccessable,SecurityCode, ' +
               'Rt_Daily_Cost,Vgt_Daily_Cost)values(@id,@desc,@addr,@city,@state,@zip,@phone,@active,@welch,@code,@rtcost,@vgtcost)';
    var request = new Request(sql, function (err, sqlResults) {
      if (err) {
        connection.close();
        request = null;
        sql = null;
        return cb(err, null);
      }
      connection.close();
      request = null;
      sql = null;
      return cb(null, 'ok');
    });
    request.addParameter('id', TYPES.Int, data.operator.operatorId);
    request.addParameter('desc', TYPES.VarChar, data.operator.desc);
    request.addParameter('addr', TYPES.VarChar, data.operator.address);
    request.addParameter('city', TYPES.VarChar, data.operator.city);
    request.addParameter('state', TYPES.VarChar, data.operator.state);
    request.addParameter('zip', TYPES.VarChar, data.operator.zip);
    request.addParameter('phone', TYPES.VarChar, data.operator.phone);
    request.addParameter('active', TYPES.Bit, active);
    request.addParameter('welch', TYPES.Bit, welch);
    request.addParameter('code', TYPES.VarChar, data.operator.code);
    request.addParameter('rtcost', TYPES.Int, data.operator.rtcost);
    request.addParameter('vgtcost', TYPES.Int, data.operator.vgtcost);
    connection.execSql(request);

  });
}

//Just used from the test code to test each function
function OperatorFuncTest(cb) {

    dbConnect.GetFederatedDbConnection(15, function (err, connection) {
      if (err){
        return cb(err, null);
      }
      AddScAssignedMenus(connection, 15, function (err, result) {
        if (err) {
          console.log(err);
          connection.close();
          return cb(err, null);
        }
        connection.close();
        return cb(null, 'ok');
      });
    });


}


function AddOperator(data, cb) {
  AddCfOperators(data, function (err, result) {
    if (err) {
      console.log(err);
      return cb(err, null);
    }
    dbConnect.GetFederatedDbConnection(data.operator.operatorId, function (err, connection) {
      if (err){
        return cb(err, null);
      }

      async.series([
        function(callback) {
          AddScAssignedForms( connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddSlType(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddSlStyle(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();

          });
        },
        function(callback) {
          AddSlManuf(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddSlLease(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddControl(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddScCorpEntities(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddScAssignedMenus(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddScUsers(data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddScGroups(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddScAssignedForms(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          UpdateScAssignedForms(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddScConfigure(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
          AddCfTransTypes(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });
        },
        function(callback) {
             AddScCustomFields(connection, data.operator.operatorId, function (err, result) {
            if (err) {
              return callback(err);
            }
            callback();
          });       
        }
        ], function(err) {
          if (err) {
            connection.close();
            console.log(err);
            LogError(data.operator.operatorId,err,function(err, result) {

            });
            return cb(err, null);
          }
          console.log('async done');
          connection.close();
          return cb(null, 'ok');
        });
    });
});
  //     AddScAssignedForms( connection, data.operator.operatorId, function (err, result) {
  //       if (err) {
  //         console.log(err);
  //       }
  //       return cb(null, 'ok');
  //     });
  //   });

  // });
}


function GetOperatorSeeds(cb) {
  var data;
  dbConnect.GetDbConnection(function (err, connection) {
    if (err) {
      return cb(err, null);
    }
    var sql = 'select max(ID) from cf_Operators where Id < 9999';
    var request = new Request(sql, function (err, sqlResults) {
      if (err) {
        connection.close();
        sql = null;
        console.log(err);
        return cb(err, null);
      }
      connection.close();
      sql = null;
      request = null;
      return cb(null, data);
    });

    request.on('row', function (columns) {
      var id = parseInt(columns[0].value,10);
      id++;

      var opCode = uuid.create().toString();
      opCode = opCode.substring(0,10);
      data = {
        OperatorId: id.toString(),
        SecCode: opCode.toUpperCase()
      };
    });
    connection.execSql(request);

  });
}

function GetOperatorTableLayout() {

  var data = {
      cols: {
        OperatorId: {
          index: 1,
          unique: true,
          type: "number"
        },
        Desc: {
          index: 2,
          type: "string"
        },
        Address: {
          index: 3,
          type: "string"
        },
        City: {
          index: 4,
          type: "string"
        },
        State: {
          index: 5,
          type: "string"
        },
        Zip: {
          index: 6,
          type: "string"
        },
        Phone: {
          index: 7,
          type: "string"
        },
        Active: {
          index: 8,
          type: "bool"
        },
        Welch: {
          index: 9,
          type: "bool"
        },
        Code: {
          index: 10,
          type: "string"
        },
        Rt_Cost: {
          index: 11,
          type: "string"
        },
        Vgt_Cost: {
          index: 12,
          type: "string"
        }
      },
      rows : [
      ]
    };

    return data;
}



function GetOperators(cb) {
  dbConnect.GetDbConnection(function (err, result) {
    console.log('in GetOperators');
    if (err) {
      return cb(err, null);
    }
    var connection = result;
    var data = new GetOperatorTableLayout();
    var sql = 'select ID,Description,Address,City,State,Zip,Phone,Active,WelchAccessable,SecurityCode,Rt_Daily_Cost,Vgt_Daily_Cost from cf_Operators';
    var request =  new Request(sql, function (err, results) {
      if (err) {
        return cb(err, null);
      }
      connection.close();
      connection = null;
      request = null;
      sql = null;
      return cb(null, data);
    });
    request.on('row', function (columns) {
      data.rows.push({OperatorId: columns[0].value,
                      Desc: columns[1].value,
                      Address: columns[2].value,
                      City: columns[3].value,
                      State: columns[4].value,
                      Zip: columns[5].value,
                      Phone: columns[6].value,
                      Active: columns[7].value,
                      Welch: columns[8].value,
                      Code: columns[9].value,
                      Rt_Cost: columns[10].value,
                      Vgt_Cost: columns[11].value  });

    });
    connection.execSql(request);

  });
}


function UpdateOperator(data, cb) {
  var sql = '';
  var active = null;
  var welch = null;


  if (typeof data.operator.active === 'undefined') {
    active = false;
  } else {
    active = data.operator.active;
  }

  if (typeof data.operator.welch === 'undefined') {
    welch = false;
  } else {
    welch = data.operator.welch;
  }

  dbConnect.GetDbConnection(function (err, results) {
    if (err) {
      return cb(err, null);
    } else {
      var connection = results;
      var sql = 'update cf_Operators set Description = @desc, Address = @addr, City = @city, State = @state, zip = @zip, Phone = @phone, ' +
                'Active = @active, WelchAccessable = @welch, Rt_Daily_Cost = @rt, Vgt_Daily_Cost = @vgt where ID = @id and SecurityCode = @code';
      var request = new Request(sql, function (err, rowCount) {
        if (err) {
          connection.close();
          connection = null;
          sql = null;
          request = null;
          console.log(err);
          return cb(err, null);
        } else {
          connection.close();
          connection = null;
          sql = null;
          request = null;
          return cb(null, 'ok');
        }
      });

      if (isNaN(data.operator.rtcost) ) {
        data.operator.rtcost = '0';
      }
    
      if (isNaN(data.operator.vgtcost) ) {
        data.operator.vgtcost = '0';
      }

      request.addParameter('desc', TYPES.VarChar, data.operator.desc);
      request.addParameter('addr', TYPES.VarChar, data.operator.address);
      request.addParameter('city', TYPES.VarChar, data.operator.city);
      request.addParameter('state', TYPES.VarChar, data.operator.state);
      request.addParameter('zip', TYPES.VarChar, data.operator.zip);
      request.addParameter('phone', TYPES.VarChar, data.operator.phone);
      request.addParameter('active', TYPES.Bit, active);
      request.addParameter('welch', TYPES.Bit, welch);
      request.addParameter('id', TYPES.Int, data.operator.operatorId);
      request.addParameter('code', TYPES.VarChar, data.operator.code);
      request.addParameter('rt', TYPES.Int, data.operator.rtcost);
      request.addParameter('vgt', TYPES.Int, data.operator.vgtcost);
      connection.execSql(request);
    }
  });
}


function LogError(operatorId,errorText,callback) {
    
    var sql = '';
    var connection;

    dbConnect.GetDbConnection(operatorId,function(err,results) {

    if ( err ) {

      return callback(err,null);

    } else {

           connection =  results;
           sql = 'insert into db_route_errorlog (operatorID,location,data,updated)values(@oper,@loc,@errText,@date)';
           var request = new Request(sql,function(err,rowCount) {
        
        
            if (err) {
                connection.close();
                sql = null;
                console.log(errorText);
                return callback(err,null);
            } else {
                connection.close();
                sql = null;
                request = null;
                rowCount = null;
                return callback(null,'ok');
            }
        });

        request.addParameter('oper', TYPES.Int,operatorId);
        request.addParameter('loc', TYPES.VarChar,'OperAdd');
        request.addParameter('errText', TYPES.VarChar,errorText);
        request.addParameter('date', TYPES.DateTime,new Date());

        connection.execSql(request);

    }

    });

}





// function UpdateOperator(data, cb) {
//   var connection = null;
//   var active = null;
//   var welch = null;

//   if (data.operator.active === 'undefined') {
//     active = false;
//   }

//   if (data.operator.welch === 'undefined') {
//     welch = false;
//   }

//   dbConnect.GetDbConnection(function (err, result) {
//     if (err) {
//       return cb(err);
//     }
//     connection = result;
//     var sql = 'update cf_Operators set Description = @desc, Address = @addr, City = @city, State = @state, Phone = @phone, ' +
//               'Active = @active, WelchAccessable = @welch where ID = @id and SecurityCode = @code';
//     var request =  new Request(sql, function (err, results) {
//       if (err) {
//         console.log(err);
//         connection.close();
//         return cb(err, null);
//       } else {
//         connection.close();
//         return cb(null, 'ok');
//       }
      

//       request.addParameter('desc', TYPES.VarChar, data.operator.desc);
//       request.addParameter('addr', TYPES.VarChar, data.operator.address);
//       request.addParameter('city', TYPES.VarChar, data.operator.city);
//       request.addParameter('state', TYPES.VarChar, data.operator.state);
//       request.addParameter('zip', TYPES.VarChar, data.operator.zip);
//       request.addParameter('phone', TYPES.VarChar, data.operator.phone);
//       request.addParameter('active', TYPES.Bit, active);
//       request.addParameter('welch', TYPES.Bit, welch);
//       request.addParameter('id', TYPES.Int, data.operator.operatorId);
//       request.addParameter('code', TYPES.VarChar, data.operator.code);
//       connection.execSql(request);      
//     });

  
//   });
// }

module.exports = {
  GetOperators     : GetOperators,
  UpdateOperator   : UpdateOperator,
  GetOperatorSeeds : GetOperatorSeeds,
  AddOperator      : AddOperator,
  OperatorFuncTest : OperatorFuncTest,
  GetOperatorReportData : GetOperatorReportData
};