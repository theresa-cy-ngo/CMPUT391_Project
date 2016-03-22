#!/bin/env node

var express = require('express'),
    app = express(),
    http = require('http'),
    oracledb = require('oracledb'),
    dbConfig = require('./dbconfig.js'),
    bodyParser = require('body-parser'),
    cookieParser = require("cookie-parser"),
    ejs = require('ejs'),
    util = require('util'),
    path = require("path"),
    url = require("url");




app.set('view engine', ejs);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//Set port number.
app.set('port', 8080);
app.set('ip', "127.0.0.1");

//Add public folder for static files
app.use(express.static(__dirname));

// //Set first page
// app.get('/', function(request, response) {
//   response.render(__dirname + '/app/index');
// });

app.get("*", function (req, res) {
    var resource = url.parse(req.url).pathname;
    if(~resource.indexOf("node_modules") || ~resource.indexOf("bower_components")) {
        res.sendFile(path.join(__dirname));
    } else {
        if(resource.slice(-1) !== "/") {
            res.sendFile(path.join(__dirname + "/app" + resource));
        } else {
            res.sendFile(path.join(__dirname + "/app" + resource, "index.html"));
        }
    }
});

//Server
http.createServer(app).listen(app.get('port') ,app.get('ip'), function () {
    console.log("✔ Express server listening at %s:%d ", app.get('ip'),app.get('port'));
});

process.on('SIGINT', function() {
  process.exit();
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


app.post("/login", function (req, res) {
    oracledb.getConnection(dbConfig, function (err, connection) {
            if (err) {
                connectionError(err, res);
                return;
            }
            connection.execute(
                "SELECT * " +
                "FROM users " +
                "WHERE user_name = :user_name AND password = :password",
                {user_name: req.body.userName, password: req.body.password},
                function (err, result) {
                    if (err) {
                        executeError(err, res);
                    } else {
                        console.log(util.inspect(result, {showHidden: false, depth: null}));
                        if(result.rows.length > 0) {
                            // // Set cookies
                            // res.cookie("user_name", req.body.userName);
                            // res.cookie("login", true);
                            res.send({success: true});
                        } else {
                            res.status(422);
                            res.send(
                                {
                                    error: true,
                                    errorCode: 2,
                                    message: "Username or password is incorrect. Please try again.",
                                    success: false
                                }
                            );
                        }
                    }
                    doRelease(connection);
                }
            );
        }
    );
});

app.route("/upload")
  .get(function (req, res) {
    var DBQueryString;

        DBQueryString =
            "SELECT photo_id " +
            "FROM images " +
            "WHERE images.photo_id = " +
            "(SELECT MAX(photo_id) FROM images)";

        oracledb.getConnection(dbConfig, function (err, connection) {
            if (err) {
                connectionError(err, res);
                return;
            }
            connection.execute(DBQueryString,
                function (err, result) {
                    // console.log(util.inspect(result, {showHidden: false, depth: null}));
                    if (err) {
                        executeError(err, res);
                    } else {
                        // Should return the max id currently in the table
                        res.send(result);
                    }
                    doRelease(connection);
                }
            );
        });
    })
    .post(function (req, res) {
      var DBQueryString,
          DBQueryParam,
          photo_id = Number(req.body.new_id),
          owner_name = req.body.owner_name,
          permitted = Number(req.body.permitted),
          subject = req.body.subject,
          place = req.body.place,
          timing = null,
          description = req.body.desc,
          thumbnail = null,
          photo = null;

          DBQueryString =
              "INSERT INTO images " +
              "(PHOTO_ID, OWNER_NAME, PERMITTED, SUBJECT, PLACE, TIMING, DESCRIPTION, THUMBNAIL, PHOTO) " +
              "VALUES (:photo_id, :owner_name, :permitted, :subject, :place, :timing, :description, :thumbnail, :photo) ";

          console.log(DBQueryString);

          DBQueryParam = {photo_id: photo_id,
                          owner_name: owner_name,
                          permitted: permitted,
                          subject: subject,
                          place: place,
                          timing: timing,
                          description: description,
                          thumbnail: thumbnail,
                          photo: photo
                          };
          console.log(DBQueryParam);

          oracledb.getConnection(dbConfig, function (err, connection) {
              if (err) {
                  connectionError(err, res);
                  return;
              }
              connection.execute(DBQueryString, DBQueryParam,
                  function (err, result) {
                      // console.log(util.inspect(result, {showHidden: false, depth: null}));
                      if (err) {
                          executeError(err, res);
                      } else {
                          // Should return the max id currently in the table
                          res.send({success: true});
                      }
                      doRelease(connection);
                  }
              );
          });
      });

//Disconnect from Oracle
function doRelease(connection)
{
  console.log("connect release");
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

function connectionError(err, res) {
    console.error(err.message);
    res.status(500);
    res.send(
        {
            error: true,
            errorCode: 1,
            message: "Unable to connect to database. Please try again"
        }
    );
}

function executeError(err, res) {
    console.log(err.message);
    res.status(500);
    res.send(
        {
            error: true,
            errorCode: 3,
            message: "There was a problem retrieving data. Please try again",
            success: false
        }
    );
}

function notAuthorized(res) {
    res.status(401);
    res.send({
        error: true,
        errorCode: 99,
        message: "You are not authorized to view this data"
    });
}
