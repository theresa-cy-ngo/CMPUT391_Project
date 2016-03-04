#!/bin/env node

var express = require('express'),
    app = express(),
    http = require('http'),
    oracledb = require('oracledb');

//Set port number. This will be changed to the port assigned to us
app.set('port', 8080);
app.set('ip', "127.0.0.1");


//Add public folder for static files
app.use(express.static(__dirname + '/public'));


//Set first page
app.get('/', function(request, response) {
  response.render('view/index');
});

oracledb.getConnection(
  {
    user          : "jwoo",
    password      : "", //Put password here (I'll message you my password :P)
    connectString : ""
    //if WFH then localhost:1525/CRS
    //if lab machine then CRS
  },
  function(err, connection)
  {
    if (err) {
      console.error(err.message);
      return;
    }
    connection.execute(
      "SELECT * " +
      "FROM COURSE ",
      function(err, result)
      {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        console.log(result.metaData);
        console.log(result.rows);
        doRelease(connection);
      });
  });

function doRelease(connection)
{
  connection.release(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}



//Server
http.createServer(app).listen(app.get('port') ,app.get('ip'), function () {
    console.log("✔ Express server listening at %s:%d ", app.get('ip'),app.get('port'));
});
