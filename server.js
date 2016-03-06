#!/bin/env node

var express = require('express'),
    app = express(),
    http = require('http'),
    oracledb = require('oracledb'),
    dbConfig = require('./dbconfig.js'),
    bodyParser = require("body-parser");

app.use(bodyParser.json());

//Set port number.
app.set('port', 8080);
app.set('ip', "127.0.0.1");

//Add public folder for static files
app.use(express.static(__dirname + '/public'));

//Set first page
app.get('/', function(request, response) {
  response.render('view/index');
});

//Server
http.createServer(app).listen(app.get('port') ,app.get('ip'), function () {
    console.log("✔ Express server listening at %s:%d ", app.get('ip'),app.get('port'));
});


//Get Oracle connection (test function)
// oracledb.getConnection(dbConfig, function(err, connection) {
//     if (err) {
//       console.error(err.message);
//       return;
//     }
//     connection.execute(
//       "SELECT * " +
//       "FROM COURSE ",
//       function(err, result)
//       {
//         if (err) {
//           console.error(err.message);
//           doRelease(connection);
//           return;
//         }
//         console.log(result.metaData);
//         console.log(result.rows);
//         doRelease(connection);
//       });
//   });

//Disconnect from Oracle
function doRelease(connection)
{
  connection.release(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}


/**
* Connection Errors
*/

// function connectionError(err, res) {
//     console.error(err.message);
//     res.status(500);
//     res.send(
//         {
//             error: true,
//             errorCode: 1,
//             message: "Unable to connect to database. Please try again"
//         }
//     );
// }
//
// function executeError(err, res) {
//     console.log(err.message);
//     res.status(500);
//     res.send(
//         {
//             error: true,
//             errorCode: 3,
//             message: "There was a problem retrieving data. Please try again",
//             success: false
//         }
//     );
// }
//
// function notAuthorized(res) {
//     res.status(401);
//     res.send({
//         error: true,
//         errorCode: 99,
//         message: "You are not authorized to view this data"
//     });
// }
