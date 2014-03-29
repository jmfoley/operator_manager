// PDFDocument = require('pdfkit');
// doc = new PDFDocument();

// doc.font('Times-Roman', 35)
//    .text('This is the title!', { align: 'center' })
//    .font('Helvetica', 12)
//    .moveDown();


// doc.text('This text is left aligned. ' , {
//   width: 410,
//   align: 'left'
// });

// doc.moveDown();

// doc.text('This text is center aligned. ' , {
//   width: 410,
//   align: 'center'
// });

// doc.moveDown();

// doc.text('This text is right aligned. ' , {
//   width: 410,
//   align: 'right'
// });

// doc.moveDown();




// doc.write('test.pdf');


var Report = require('fluentreports' ).Report;
var fs = require('fs');

function FormatTotal(data) {
  var tmp = data.toString();

  var total = tmp.replace('$', "");
  total = total.replace(' ', "");
  total = total.replace('.', "");
 // console.log('New Total = ' + total);

  return parseInt(total, 10);
}

function PrintReport(data, startDate, endDate, cb) {
  var invoiceTotal = 0;
  var page = 0;
// var d = new Date();
// var dateStr = (d.getMonth() + 1).toString() + "/" + d.getDate().toString() + "/" + d.getFullYear().toString();
// console.log('Date = ' + dateStr);

// var rtRate = 75 * 2 / 100.0;
// var vgtRate = 100 * 3 / 100.0;

// console.log('rt rate = $ ' + rtRate.toFixed(2));
// console.log('vgt rate = $ ' + vgtRate.toFixed(2));


// var d1 = new Date();
// d1.setDate(d1.getDate()-13);
// var dateStr1 = (d1.getMonth() + 1).toString() + "/" + d1.getDate().toString() + "/" + d1.getFullYear().toString();
// console.log('Date1 = ' + dateStr1);
  //var invoiceTotal = 0;

  'use strict';
  var mydata1 = data;
  // var mydata1 = 
  // [
  //   {operator :"Test Operator", operatorid:10,site:"The Slophouse1",siteid:1, date:"2014-03-12",rtcount:1,vgtcount:3,rtcost:75,vgtcost:100 },
  //   {operator :"Test Operator", operatorid:10,site:"The Slophouse1",siteid:2, date:"2014-03-13",rtcount:1,vgtcount:3,rtcost:75,vgtcost:100 },
  //   {operator :"Test Operator", operatorid:10,site:"The Slophouse2",siteid:3, date:"2014-03-12",rtcount:1,vgtcount:3,rtcost:75,vgtcost:100 },
  //   {operator :"Test Operator", operatorid:10,site:"The Slophouse2",siteid:4, date:"2014-03-13",rtcount:1,vgtcount:3,rtcost:75,vgtcost:100 },
  //   {operator :"Test Operator", operatorid: 10, site:"Josh\'s Gay Bar",siteid:5,date:"2014-03-12",rtcount:1,vgtcount:3,rtcost:75,vgtcost:100 }
  // ];

var Title = function(report, data) {
///home/azureuser/opmanager/public/reports/
  if (fs.existsSync('/home/azureuser/opmanager/public/images/m3t_logo.jpg')) {
      report.image('/home/azureuser/opmanager/public/images/m3t_logo.jpg', {width: 100});
    } 
   
    report.newline();
    report.newline();
    report.newline();
    //report.newline();

    report.print('Operator Billing Summary -- ' + mydata1[0].operator,{fontBold: true, fontSize: 14, align:'center'});
    report.newline();
    report.newline();
    report.print('Date Printed: ' + new Date().toString('mm/dd/yyyy') + '                                                              Page: ' + page++, {align:'left'});
    //report.print('Page: ' + page++, {align:'right'});
    //report.newline();
    report.print("Billing Period: " + startDate + ' - ' + endDate);
    report.newline();
     report.newline();

  };


  var daydetail = function ( report, data ) {
    report.band( [
      //[data.operator, 80],
      [data.site, 100],
      [data.date, 70],
      [data.rtcount, 30, 3],
      [data.vgtcount, 30, 3],
      ['$ ' + (data.rtcost / 100.0).toFixed(2), 70, 3],
      ['$ ' + (data.vgtcost / 100.0).toFixed(2), 70, 3],
      ['$ ' + (data.rttotal / 100.0).toFixed(2), 70, 3],
      ['$ ' + (data.vgttotal / 100.0).toFixed(2), 70, 3]
    ], {border:1, width: 0, wrap: 1} );
    
  };

  var namefooter = function ( report, data, state ) {
    report.newLine();
    report.band( [
      ["Totals for " + data.site, 192],
      [report.totals.rtcount, 30],
      [report.totals.vgtcount, 188],
      //[report.totals.rtcost, 70],
      //[report.totals.vgtcost, 50],
      [report.totals.rttotal, 70],
      [report.totals.vgttotal, 50]
    ] );

    report.newLine();

   var tmp = report.totals.vgttotal;
    var vgttotal =   FormatTotal(tmp);
    console.log('VGTTotal = : ' + vgttotal.toString());

    var tmp1 = report.totals.rttotal;
    var rttotal =   FormatTotal(tmp1);
    console.log('RT Total = : ' + rttotal.toString());

    var totalDue = ((rttotal + vgttotal) / 100.0).toFixed(2);
    invoiceTotal += (rttotal + vgttotal);

    report.band( [
      ["Total Due: $ ", 60],
      [totalDue,50]
      ]);

    report.newLine();
    report.newLine();

    
  };

  var nameheader = function ( report, data ) {
    report.print( data.operator, {fontBold: true} );
  };

  var weekdetail = function ( report, data ) {
    // We could do this -->  report.setCurrentY(report.getCurrentY()+2);   Or use the shortcut below of addY: 2
    //report.print( ["Week Number: " + data.week], {x: 100, addY: 2} );
    report.print( "Site: " + data.site + ' - Site Id: ' + data.siteid, {x: 100, addY: 2, fontBold:true} );
     report.newline();
    report.band([
    //{data: 'Operator', width: 80, fontBold:true},
    {data: 'Site', width: 100, fontBold:true},
    {data: 'Date', width: 70, fontBold:true},
    {data: 'Rt\'s', width: 30, fontBold:true},
    {data: 'Vgt\'s', width: 30, fontBold:true},
    {data: 'Rt $ Per Day', width: 68, fontBold:true},
    {data: 'Vgt $ Per Day', width: 70, fontBold:true},
    {data: 'Rt Total', width: 70, fontBold:true},
    {data: 'Vgt Total', width: 70, fontBold:true}
    
    // {data: 'Cust PO'},
    // {data: 'Invoice Date', width: 60},
    // {data: 'Current', align: 3, width: 60},
    // {data: '31-60 Days', width: 60, align: 3},
    // {data: '61-90 Days', width: 60, align: 3},
    // {data: '91-120 Days', width: 65, align: 3},
    // {data: '>120 Days', width: 60, align: 3},
    // {data: 'Total Due', width: 60, align: 3}
  ]);

    
  
  };
  
var finalSummary = function(rpt, data) {
    rpt.band( [
    ["Totals " , 410],
    //[rpt.totals.rtcount, 30],
    //[rpt.totals.vgtcount, 188],
    //[rpt.totals.rtcost, 70],
    //[rpt.totals.vgtcost, 70],
    [rpt.totals.rttotal, 70],
    [rpt.totals.vgttotal, 50]
  ] );

    console.log('Invoice Total: ' + invoiceTotal);
    rpt.newline();
    rpt.newline();

    rpt.band( [
       {data: "Invoice Total ",width:105, fontBold:true,fontSize:14},
       {data:'$ ' + (invoiceTotal / 100.0).toFixed(2), width:90,fontBold:true,fontSize:14}
    ]);   
    
};

var totalFormatter = function(data, callback) {
  for (var key in data) {
      if (key === 'vgtcount' || key === 'rtcount') {
        console.log(key + ' ' + data[key]);
        continue;
      }
      if (data.hasOwnProperty(key)) {
          // Simple Stupid Money formatter.  It is really dumb.  ;-)
          data[key] = '$ '+data[key]/100.0;
          var idx = data[key].indexOf('.');
          if (idx < 0) {
              data[key] += '.00';
          } else if (idx == data[key].length - 2) {
              data[key] += '0';
          }
      }
  }
  callback(null, data);
};




  // You don't have to pass in a report name; it will default to "report.pdf"
  //var reportName = "./public/reports/OpReport-" + mydata1[0].operatorid.toString() + ".pdf";
  var reportName = '/home/azureuser/opmanager/public/reports/OpReport-'+ data[0].operatorid.toString() + '.pdf';
  var reportPath = "/reports/OpReport-" + data[0].operatorid.toString() + ".pdf";

  var rpt = new Report(reportName)
      .autoPrint(false) // Optional
    //  .pageHeader( ["Operator Billing Summary -- " + mydata1[0].operator],  {fontBold:true} )// Optional
      .pageHeader(Title)
      //.pageHeader( [mydata1.operator] )// Optional
      .finalSummary( finalSummary)// Optional
      //.userdata( {hi: 1} )// Optional 
      .data( mydata1)  // REQUIRED
      .sum("rtcount")
      .sum("vgtcount")  // Optional
      .sum("vgtcost")
      .sum("rtcost")
      .sum("rttotal")
      .sum("vgttotal")
      .detail( daydetail ) // Optional
      .totalFormatter( totalFormatter ) // Optional
      .fontSize(10); // Optional

  rpt.groupBy( "site" )
      .header( nameheader )
      .footer( namefooter )
      .finalSummary( finalSummary)// Optional
      .sum("rtcount")
      .sum("vgtcount")
      .sum("vgtcost")
      .sum("rtcost")
      .sum("rttotal")
      .sum("vgttotal")
      .totalFormatter( totalFormatter )
      .groupBy( "operator" )
         .header( weekdetail );





  // Debug output is always nice (Optional, to help you see the structure)
  rpt.printStructure();


  // This does the MAGIC...  :-)
  console.time("Rendered");
  var a= rpt.render(function(err, name) {
      console.timeEnd("Rendered");
      if (err) {
          console.error("Report had an error",err);
          cb(err,null);
      } else {
        console.log("Report is named:",name);
        
        cb(null,reportPath);
      }
  });

}



//printreport();

module.exports = {
  PrintReport     : PrintReport
};

