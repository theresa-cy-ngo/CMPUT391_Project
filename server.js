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
    url = require("url"),
    atob = require("atob"),
    stream = require("stream"),
    Q = require("q");




app.set('view engine', ejs);
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended:true}));
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



app.post("/login", function (req, res) {
    console.log(util.inspect(req.body, {showHidden: false, depth: null}));

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
                        // console.log(util.inspect(result, {showHidden: false, depth: null}));
                        if(result.rows.length > 0) {
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

app.post("/photoid", function(req, res){
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
                        res.send({result: result.rows, success:true});
                    }
                    doRelease(connection);
                }
            );
        });
});


app.post("/groupid", function(req, res){
    oracledb.getConnection(dbConfig, function (err, connection) {
            if (err) {
                connectionError(err, res);
                return;
            }
            connection.execute(
                "SELECT GROUP_ID " +
                "FROM groups " +
                "ORDER BY GROUP_ID desc",
                function (err, result) {
                    if (err) {
                        executeError(err, res);
                    } else {
                        // console.log(util.inspect(result, {showHidden: false, depth: null}));
                        if(result.rows.length > 0) {
                            res.send({lastID: result.rows[0][0], success: true});
                        } else {
                            res.status(500);
                            res.send(
                                {
                                    error: true,
                                    errorCode: 2,
                                    message: "Could not retrieve data",
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

//Based on code found here: https://github.com/oracle/node-oracledb/blob/master/doc/api.md#lobhandling
app.post("/upload", function(req, res){
  // console.log(req.body.timing);
    var DBQueryString =
        // "INSERT INTO images (photo_id, owner_name, permitted, subject, place, timing, description, thumbnail, photo) VALUES (:photo_id, :owner_name, :permitted, :subject, :place, :timing, :description, EMPTY_BLOB(), EMPTY_BLOB()) RETURNING photo, thumbnail INTO :lobbv, :lobtn",
        // "INSERT INTO images (photo_id, owner_name, permitted, subject, place, timing, description, thumbnail, photo) VALUES (7, 'test1', null, null, null, null, null, EMPTY_BLOB(), EMPTY_BLOB()) RETURNING photo, thumbnail INTO :lobbv, :lobtn",
//TO_DATE(timing, 'YYYY-MM-DD')
"INSERT INTO images (photo_id, owner_name, permitted, subject, place, timing, description, thumbnail, photo) VALUES (:photo_id, :owner_name, :permitted, :subject, :place, TO_DATE (:timing, 'yyyy/mm/dd'), :description, EMPTY_BLOB(), EMPTY_BLOB()) RETURNING photo, thumbnail INTO :lobbv, :lobtn",

        DBQueryParam = {photo_id: req.body.photo_id,
                        owner_name: req.body.owner_name,
                        permitted: req.body.permitted,
                        subject: req.body.subject,
                        place: req.body.place,
                        timing: req.body.timing,
                        description: req.body.descr,
                        lobbv: {type: oracledb.BLOB, dir: oracledb.BIND_OUT},
                        lobtn: {type: oracledb.BLOB, dir: oracledb.BIND_OUT}
                      };

        console.log(req.body.timing);

    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(
           DBQueryString,
           DBQueryParam,
           {autoCommit: false},

           function (err, result) {
                var byteCharacters, buffer, i, lob,
                    bufferStream, view, arrayBuffer, bytes;
                var imageDeferred = Q.defer();
                var thumbnailDeferred = Q.defer();

                if (err || result.rowsAffected != 1 || result.outBinds.lobbv.length != 1) {
                    executeError(err, res);
                } else {
                    // Create an ArrayBuffer from the base64 image
                    byteCharacters = atob(req.body.photo);
                    bytes = new Uint8Array(byteCharacters.length);
                    for (i = 0; i < byteCharacters.length; i++) {
                        bytes[i] = byteCharacters.charCodeAt(i);
                    }
                    arrayBuffer = bytes.buffer;
                    // Create an ArrayBuffer from the base64 thumbnail
                    thumbnailCharacters = atob(req.body.thumbnail);
                    thumbnailBytes = new Uint8Array(thumbnailCharacters.length);
                    for (i = 0; i < thumbnailCharacters.length; i++) {
                        thumbnailBytes[i] = thumbnailCharacters.charCodeAt(i);
                    }
                    thumbnailArrayBuffer = thumbnailBytes.buffer;

                    // Create a Node.js Buffers from the ArrayBuffers
                    buffer = new Buffer(arrayBuffer.byteLength);
                    view = new Uint8Array(arrayBuffer);
                    for (i = 0; i < buffer.length; i++) {
                        buffer[i] = view[i];
                    }
                    thumbnailBuffer = new Buffer(thumbnailArrayBuffer.byteLength);
                    view = new Uint8Array(thumbnailArrayBuffer);
                    for (i = 0; i < thumbnailBuffer.length; i++) {
                        thumbnailBuffer[i] = view[i];
                    }

                    // Put the buffer into a stream so that it can be piped to oracle blob
                    bufferStream = new stream.PassThrough();
                    bufferStream.end(buffer);
                    thumbnailStream = new stream.PassThrough();
                    thumbnailStream.end(thumbnailBuffer);

                    // When the buffer finishes writing to the lob, resolve the deferred
                    bufferStream.on("end", function () {
                        imageDeferred.resolve();
                    });
                    thumbnailStream.on("end", function () {
                        thumbnailDeferred.resolve();
                    });
                    // If there is an error then handle it
                    bufferStream.on("error", function (err) {
                        executeError(err, res);
                        imageDeferred.reject();
                    });
                    thumbnailStream.on("error", function (err) {
                        executeError(err, res);
                        thumbnailDeferred.reject();
                    });

                    Q.allSettled([imageDeferred.promise, thumbnailDeferred.promise]).then(function () {
                    // Q.allSettled([imageDeferred.promise]).then(function () {

                        connection.commit(function (err) {
                            if (err) {
                                executeError(err, res);
                            } else {
                                res.send({success: true});
                            }
                        });

                    });

                    lob = result.outBinds.lobbv[0];
                    thumbnaillob = result.outBinds.lobtn[0];

                    // If there is an error then handle it
                    lob.on("error", function (err) {
                        executeError(err, res);
                        imageDeferred.reject();
                    });
                    thumbnaillob.on("error", function (err) {
                        executeError(err, res);
                        thumbnailDeferred.reject();
                    });

                    lob.on('finish', function() {
                        console.log("lob.on 'finish' event");
                        connection.commit( function(err) {
                            if (err)
                              console.error(err.message);
                            else
                              console.log("Image uploaded successfully.");
                                connection.release(function(err) {
                                  if (err) console.error(err.message);
                                });
                          });
                      });

                    // Put the images into the blob
                    bufferStream.pipe(lob);
                    thumbnailStream.pipe(thumbnaillob);
                }
            }
        );

   });
});

//testing
app.get("/upload", function(req, res){
    var DBQueryString =
        "select * from images where photo_id = :photoid",
        DBQueryParam = {photoid: req.query.photoID};


        oracledb.getConnection(dbConfig, function (err, connection) {
            if (err) {
                connectionError(err, res);
                return;
            }
           connection.execute(DBQueryString, DBQueryParam,
               {autoCommit: true},
               function (err, result) {
                   var lob, buffer, bufferLength;
                        // Array of promises
                        var lobLoading = [];
                        var lobPromises = [];
                   if (err) {
                       executeError(err, res);
                   } else {
                       result.rows.forEach(function (row, index, array) {
                            lob = row[row.length-1];
                            thumbnailLob = row[row.length-2];
                            buffer = new Buffer(0);
                            bufferLength = 0;
                            thumbnailBuffer = new Buffer(0);
                            thumbnailBufferLength = 0;
                            if (lob) {
                                // Add promise at index
                                // Have to use index*2 because each row has two blobs
                                // Q sucks, so we have to make an array of the deferreds and the promises...
                                lobLoading[index*2] = Q.defer();
                                lobPromises[index*2] = lobLoading[index*2].promise;
                                // When data comes in from the stream, add it to the buffer
                                lob.on("data", function (chunk) {
                                    bufferLength = bufferLength + chunk.length;
                                    buffer = Buffer.concat([buffer, chunk], bufferLength);
                                });
                                //When the data is finished coming in, change it to base 64 and add to result
                                lob.on("end", function () {
                                    result.rows[index][row.length-1] = buffer.toString("base64");
                                });
                                // When the stream closes, resolce the promsie
                                lob.on("close", function (chunk) {
                                    // Fulfill promise
                                    lobLoading[index*2].resolve();
                                });
                                // Make sure we reject the promise when the stream fails so that we don't have a memory leak
                                lob.on("error", function () {
                                    executeError(err, res);
                                    // Reject promise
                                    lobLoading[index*2].reject();
                                });
                            }
                            if (thumbnailLob) {
                                // Add promise at index
                                lobLoading[index*2+1] = Q.defer();
                                lobPromises[index*2+1] = lobLoading[index*2+1].promise;
                                // When data comes in from the stream, add it to the buffer
                                thumbnailLob.on("data", function (chunk) {
                                    thumbnailBufferLength = thumbnailBufferLength + chunk.length;
                                    thumbnailBuffer = Buffer.concat([thumbnailBuffer, chunk], thumbnailBufferLength);
                                });
                                //When the data is finished coming in, change it to base 64 and add to result
                                thumbnailLob.on("end", function () {
                                    result.rows[index][row.length-2] = thumbnailBuffer.toString("base64");
                                });
                                // When the stream closes, resolve the promsie
                                thumbnailLob.on("close", function (chunk) {
                                    // Fulfill promise
                                    lobLoading[index*2+1].resolve();
                                });
                                // Make sure we reject the promise when the stream fails so that we don't have a memory leak
                                thumbnailLob.on("error", function () {
                                    executeError(err, res);
                                    // Reject promise
                                    lobLoading[index*2+1].reject();
                                });
                            }
                        });
                        // When all promises complete, return the results
                        Q.allSettled(lobPromises).then(function () {
                            res.send({
                                success: true,
                                data: result.rows
                            });
                        });
                    }
                }

                    // doRelease(connection);

            );
        });
});


app.route("/displayGroup")
    .get(function(req, res){
        var DBQueryString =
               "SELECT friend_id, date_added " +
               "FROM GROUP_LISTS " +
               "WHERE GROUP_ID = :groupID" ,
               DBQueryParam = {groupID: req.query.groupID};

           oracledb.getConnection(dbConfig, function (err, connection) {
               if (err) {
                   connectionError(err, res);
                   return;
               }
              connection.execute(DBQueryString, DBQueryParam,
                  {autoCommit: true},
                  function (err, result) {
                      if (err) {
                          executeError(err, res);
                      } else {
                          res.send({success: true, results: result.rows});
                       }
                       doRelease(connection);
                   }
               );
          });
    })
    .post(function(req, res){
        // console.log(util.inspect(req.body, {showHidden: false, depth: null}));
        var DBQueryString =
               "INSERT INTO GROUP_LISTS (GROUP_ID, FRIEND_ID, DATE_ADDED, NOTICE)" +
               "VALUES (:group_id, :user_name, CURRENT_DATE, :notice)" ,
               DBQueryParam = {group_id: req.body.group_id, user_name: req.body.user_name, notice: null};

           oracledb.getConnection(dbConfig, function (err, connection) {
               if (err) {
                   connectionError(err, res);
                   return;
               }
              connection.execute(DBQueryString, DBQueryParam,
                  {autoCommit: true},
                  function (err, result) {
                      if (err) {
                          executeError(err, res);
                      } else {
                          res.send({success: true, results: result.rows});
                       }
                       doRelease(connection);
                   }
               );
          });
    });


app.post("/deleteMember" , function(req, res){
    var DBQueryString =
              "DELETE from GROUP_LISTS WHERE group_id = :group_id AND FRIEND_ID = :user_name" ,
              DBQueryParam = {group_id: req.body.group_id, user_name: req.body.user_name};

          oracledb.getConnection(dbConfig, function (err, connection) {
              if (err) {
                  connectionError(err, res);
                  return;
              }
             connection.execute(DBQueryString, DBQueryParam,
                 {autoCommit: true},
                 function (err, result) {
                    //  console.log(util.inspect(result, {showHidden: false, depth: null}));
                     if (err) {
                         executeError(err, res);
                     } else {
                         res.send({success: true});
                      }
                      doRelease(connection);
                  }
              );
         });
});

app.post("/deleteGroup" , function(req, res){
    var DBQueryUpdate =
        "UPDATE images " +
        "SET permitted = 2" +
        "WHERE permitted = :group_id; "

    var DBQueryStringList =
        "DELETE from GROUP_LISTS "+
        "WHERE group_id = :group_id; ";

    var DBQueryStringGroup =
        "DELETE from GROUPS " +
        "WHERE group_id = :group_id; ";

    var DBQueryParam = {group_id: req.body.group_id};

    DBQueryTotal = "BEGIN\n" + DBQueryUpdate + DBQueryStringList + DBQueryStringGroup + "END;";

    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(DBQueryTotal, DBQueryParam,
           {autoCommit: true},
           function (err, result) {
               if (err) {
                   executeError(err, res);
               } else {
                   res.send({success: true});
               }
               doRelease(connection);
            }
        );
    });
});

app.post("/memberships", function(req, res){
    var DBQueryString =
        "SELECT l.group_id, g.group_name " +
        "FROM GROUP_LISTS l, GROUPS g " +
        "WHERE l.FRIEND_ID = :userName AND l.GROUP_ID = g.GROUP_ID" ,
        DBQueryParam = {userName: req.query.userName};
    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(DBQueryString, DBQueryParam,
           {autoCommit: true},
           function (err, result) {
               if (err) {
                   executeError(err, res);
               } else {
                   res.send({success: true, results: result.rows});
               }
               doRelease(connection);
            }
        );
    });
});

app.route("/groups")
    .get(function(req, res){
        var DBQueryString =
            "SELECT * " +
            "FROM GROUPS " +
            "WHERE GROUPS.USER_NAME = :userName" ,
            DBQueryParam = {userName: req.query.userName};

        oracledb.getConnection(dbConfig, function (err, connection) {
            if (err) {
                connectionError(err, res);
                return;
            }
           connection.execute(DBQueryString, DBQueryParam,
               {autoCommit: true},
               function (err, result) {
                   if (err) {
                       executeError(err, res);
                   } else {
                    //    console.log(util.inspect(result, {showHidden: false, depth: null}));
                       res.send({success: true, results: result.rows});
                    }
                    doRelease(connection);
                }
            );
        });

    })
    .post(function(req, res){
        var DBQueryString =
            "BEGIN\n " +
            "INSERT INTO GROUPS (GROUP_ID, USER_NAME, GROUP_NAME, DATE_CREATED) " +
            "VALUES (:groupID, :userName, :groupName, CURRENT_DATE); " +

            "INSERT INTO GROUP_LISTS (GROUP_ID, FRIEND_ID, DATE_ADDED, NOTICE) " +
            "VALUES (:groupID, :userName, CURRENT_DATE, :notice); " +

            "END;",
            DBQueryParam = {groupID: req.body.groupID,
                            userName: req.body.userName,
                            groupName: req.body.groupName,
                            notice: null
                            };

        // console.log(util.inspect(req, {showHidden: false, depth: null}));

        oracledb.getConnection(dbConfig, function (err, connection) {
            if (err) {
                connectionError(err, res);
                return;
            }
           connection.execute(DBQueryString, DBQueryParam,
               {autoCommit: true},
               function (err, result) {
                   if (err) {
                       executeError(err, res);
                   } else {
                    //    console.log(util.inspect(result, {showHidden: false, depth: null}));
                       res.send({success: true});
                    }
                    doRelease(connection);
                }
            );
        });

    });



app.route("/register")
    .get(function (req, res) {
        /** Use to check if a user name or email is already taken.
         *  All parameters should be part of the query string.
         *
         *  Possible parameters:
         *       userName
         *       email
         */

        var DBQueryString,
            DBQueryParam,
            username = req.query.userName,
            email = req.query.email;

        DBQueryString =
            "SELECT * " +
            "FROM persons " +
            "WHERE persons.user_name = :user_name OR persons.email = :email";

        DBQueryParam = {user_name: username, email: email};

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
                    } else if (result.rows.length) {
                        //there was a tuple returned with the username and email
                        //so not unique and must use another combination
                        res.status(409);
                        res.send(
                            {
                                error: true,
                                errorCode: 4,
                                message: "Element already exists",
                                success: false
                            }
                        );
                    } else {
                        //username and email are unique so able to register
                        res.send({success: true});
                    }
                    doRelease(connection);
                }
            );
        });
    })
    .post (function (req, res){
        var DBQueryString,
            DBQueryParam,
            DBQueryTotal,
            username = req.body.userName;
            password = req.body.password;
            fname = req.body.fname;
            lname = req.body.lname;
            addr = req.body.addr;
            email = req.body.email;
            phone = req.body.phone;

            // Need to find how to calculate the current datestamp
            DBQueryStringUsers =
            "INSERT INTO users " +
            "(USER_NAME, PASSWORD, DATE_REGISTERED) " +
            "VALUES (:username, :password, CURRENT_DATE); ";

            DBQueryStringPersons =
            "INSERT INTO persons " +
            "(USER_NAME, FIRST_NAME, LAST_NAME, ADDRESS, EMAIL, PHONE) " +
            "VALUES (:username, :first_name, :last_name, :address, :email, :phone); ";

            DBQueryTotal = "BEGIN\n" +DBQueryStringUsers + DBQueryStringPersons + "END;";

            // Need to put the parameters in here
            DBQueryParam = {username: username,
                                  password: password,
                                  first_name: fname,
                                  last_name: lname,
                                  address: addr,
                                  email: email,
                                  phone: phone
                                  };

            // console.log(util.inspect(DBQueryParam, {showHidden: false, depth: null}));


        oracledb.getConnection(dbConfig, function (err, connection) {
            if (err) {
                connectionError(err, res);
                return;
            }
           //Execute both SQL statements
           connection.execute(DBQueryTotal, DBQueryParam,
               {autoCommit: true},
               function (err, result) {
                   if (err) {
                       executeError(err, res);
                   } else {
                       console.log(util.inspect(result, {showHidden: false, depth: null}));
                       res.send({success: true});
                    }
                    doRelease(connection);
                }
            );
        });
    });

getImages = function (row, index) {
  var lob, buffer, bufferLength;
  var lobLoadingThumb = Q.defer();
  var lobLoadingPhoto = Q.defer();
  var deferred =  Q.defer();
  var imageObj;
  var thumbObj;

  lob = row[row.length-1];
  thumbnailLob = row[row.length-2];
  buffer = new Buffer(0);
  bufferLength = 0;
  thumbnailBuffer = new Buffer(0);
  thumbnailBufferLength = 0;

  if (lob) {

        // When data comes in from the stream, add it to the buffer
        lob.on("data", function (chunk) {
            bufferLength = bufferLength + chunk.length;
            buffer = Buffer.concat([buffer, chunk], bufferLength);
        });
        //When the data is finished coming in, change it to base 64 and add to result
        lob.on("end", function () {
            imageObj = buffer.toString("base64");
        });
        // When the stream closes, resolce the promsie
        lob.on("close", function (chunk) {

            // console.log("CLOSE PHOTO + RESOLVE");

            // Fulfill promise
            lobLoadingPhoto.resolve();
        });
        // Make sure we reject the promise when the stream fails so that we don't have a memory leak
        lob.on("error", function () {
            executeError(err, res);
            // Reject promise
            lobLoadingPhoto.reject();
        });
  }
  if (thumbnailLob) {
        // When data comes in from the stream, add it to the buffer
        thumbnailLob.on("data", function (chunk) {
            thumbnailBufferLength = thumbnailBufferLength + chunk.length;
            thumbnailBuffer = Buffer.concat([thumbnailBuffer, chunk], thumbnailBufferLength);
        });
        //When the data is finished coming in, change it to base 64 and add to result
        thumbnailLob.on("end", function () {
            thumbObj = thumbnailBuffer.toString("base64");
        });
        // When the stream closes, resolve the promsie
        thumbnailLob.on("close", function (chunk) {
            // Fulfill promise
          lobLoadingThumb.resolve();
        });
        // Make sure we reject the promise when the stream fails so that we don't have a memory leak
        thumbnailLob.on("error", function () {
            executeError(err, res);
            // Reject promise
            lobLoadingThumb.reject();
        });
  }

  //When all promises complete, return the results
  Q.all([lobLoadingPhoto.promise, lobLoadingThumb.promise]).then(function () {
      deferred.resolve({imageObj: imageObj, thumbObj: thumbObj});
  }).done();

  return deferred.promise;

};

// Sends edits of an image into the database
app.post("/editImage", function(req, res){
    var DBQueryString =
        "UPDATE images " +
        "SET permitted = :permitted, subject = :subject, place = :place, timing = TO_DATE (:timing, 'yyyy/mm/dd'), description = :desc " +
        "WHERE photo_id = :photo_id" ,
        DBQueryParam = {photo_id: req.query.photo_id,
                        permitted: req.query.permitted,
                        subject: req.query.subject,
                        place: req.query.loc,
                        timing: req.query.timing,
                        desc: req.query.desc};

    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(DBQueryString, DBQueryParam,
           {autoCommit: true},
           function (err, result) {
               if (err) {
                   executeError(err, res);
               } else {
                   res.send({success: true, results: result.rows});
               }
               doRelease(connection);
            }
        );
    });
});


// Retrieves pictures that the user uploaded onto the database
app.post("/getMyPictures", function(req, res){
    var DBQueryString =
        "SELECT * " +
        "FROM images " +
        "WHERE images.owner_name = :userName" ,
        DBQueryParam = {userName: req.query.userName};
    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(DBQueryString, DBQueryParam,
           function (err, result) {
               var imageArr = [];
               var thumbArr = [];

               if (err) {
                   executeError(err, res);
               } else {

                    result.rows.forEach(function(row, index, array){
                          getImages(row).then(function(photoData){
                              imageArr.push(photoData.imageObj);
                              thumbArr.push(photoData.thumbObj);

                              if(imageArr.length == result.rows.length){
                                  // console.log("seding back");
                                  doRelease(connection);
                                  res.send({
                                    rows:result.rows,
                                    images: imageArr,
                                    thumbs: thumbArr
                                  });
                              }
                          });
                    });

                }
            }
        );
    });
});

// Retrieves pictures that others uploaded onto the database
app.post("/getGroupPictures", function(req, res){
    var DBQueryString =
        "SELECT * " +
        "FROM images " +
        "WHERE images.permitted IN " +
        "(SELECT group_id FROM group_lists WHERE group_lists.friend_id = :userName) " +
        "OR images.permitted = 1",
        DBQueryParam = {userName: req.query.userName};
    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(DBQueryString, DBQueryParam,
           function (err, result) {
               var imageArr = [];
               var thumbArr = [];
               if (err) {
                   executeError(err, res);
               } else {
                     result.rows.forEach(function(row, index, array){
                           getImages(row).then(function(photoData){
                               imageArr.push(photoData.imageObj);
                               thumbArr.push(photoData.thumbObj);

                               if(imageArr.length == result.rows.length){
                                  //  console.log("seding back");
                                   doRelease(connection);
                                   res.send({
                                     rows:result.rows,
                                     images: imageArr,
                                     thumbs: thumbArr
                                   });
                               }
                           });
                    });
                }
            }
        );
    });
});

// Get search results from only keywords
app.post("/getKeyResults", function(req, res){
    var DBQueryString =
        "SELECT * " +
        "FROM images " +
        "WHERE (images.permitted IN " +
        "(SELECT group_id FROM group_lists WHERE group_lists.friend_id = :userName) " +
        "OR images.permitted = 1 OR (images.permitted = 2 AND images.owner_name = :userName)) " +
        "AND (",
        DBSearchString = "",
        DBQueryParam = {userName: req.query.userName};

    var keywords = req.query.keywords
    var index = 0
    for (index; index < keywords.length; index++) {
        key = keywords[index];
        DBSearchString = " images.subject LIKE '%" + key + "%' OR images.description LIKE '%" + key + "%' "
        if (index != 0) {
          DBQueryString = DBQueryString + "OR" + DBSearchString
        } else {
          DBQueryString = DBQueryString + DBSearchString
        }
    }
    DBQueryString = DBQueryString + ")"

    console.log(DBQueryString);

    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(DBQueryString, DBQueryParam,
           {autoCommit: true},
           function (err, result) {
               if (err) {
                   executeError(err, res);
               } else {
                   res.send({success: true, results: result.rows});
               }
               doRelease(connection);
            }
        );
    });
});

// Get search results from only a timeframe
app.post("/getTimeResults", function(req, res){
    var DBQueryString =
        "SELECT * " +
        "FROM images " +
        "WHERE  (images.permitted IN " +
        "(SELECT group_id FROM group_lists WHERE group_lists.friend_id = :userName) " +
        "OR images.permitted = 1 " +
        "OR (images.permitted = 2 AND images.owner_name = :userName)) " +
        "AND (images.timing BETWEEN TO_DATE (:startDate, 'yyyy/mm/dd') AND TO_DATE (:endDate, 'yyyy/mm/dd'))",
        DBQueryParam = {userName: req.query.userName, startDate: req.query.timeStart, endDate: req.query.timeEnd};

    console.log(DBQueryString);
    console.log(DBQueryParam);
    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(DBQueryString, DBQueryParam,
           {autoCommit: true},
           function (err, result) {
               if (err) {
                   executeError(err, res);
               } else {
                   res.send({success: true, results: result.rows});
               }
               doRelease(connection);
            }
        );
    });
});

// Get search results from both keywords and a timeframe
app.post("/getKeyTimeResults", function(req, res){
    var DBQueryString =
        "SELECT * " +
        "FROM images " +
        "WHERE  (images.permitted IN " +
        "(SELECT group_id FROM group_lists WHERE group_lists.friend_id = :userName) " +
        "OR images.permitted = 1 " +
        "OR (images.permitted = 2 AND images.owner_name = :userName)) " +
        "AND (images.timing BETWEEN TO_DATE (:startDate, 'yyyy/mm/dd') AND TO_DATE (:endDate, 'yyyy/mm/dd'))" +
        "AND (",
        DBSearchString = "",
        DBQueryParam = {userName: req.query.userName, startDate: req.query.timeStart, endDate: req.query.timeEnd};

    var keywords = req.query.keywords
    var index = 0
    for (index; index < keywords.length; index++) {
        key = keywords[index];
        DBSearchString = " images.subject LIKE '%" + key + "%' OR images.description LIKE '%" + key + "%' "
        if (index != 0) {
          DBQueryString = DBQueryString + "OR" + DBSearchString
        } else {
          DBQueryString = DBQueryString + DBSearchString
        }
    }
    DBQueryString = DBQueryString + ")"

    console.log(DBQueryString);

    oracledb.getConnection(dbConfig, function (err, connection) {
        if (err) {
            connectionError(err, res);
            return;
        }
       connection.execute(DBQueryString, DBQueryParam,
           {autoCommit: true},
           function (err, result) {
               if (err) {
                   executeError(err, res);
               } else {
                   res.send({success: true, results: result.rows});
               }
               doRelease(connection);
            }
        );
    });
});

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
