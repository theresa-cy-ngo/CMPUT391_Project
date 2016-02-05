#!/bin/env node

var express = require('express'),
    app = express(),
    http = require('http');

//Set port number. This will be changed to the port assigned to us
app.set('port', 8080);


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
