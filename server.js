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

// app.get("/displayGroup", function(req, res){
//     var DBQueryString =
//         "SELECT * " +
//         "FROM GROUP_LISTS " +
//         "WHERE GROUP_ID = :groupID" ,
//         DBQueryParam = {groupID: req.query.groupID};
//
//     oracledb.getConnection(dbConfig, function (err, connection) {
//         if (err) {
//             connectionError(err, res);
//             return;
//         }
//        connection.execute(DBQueryString, DBQueryParam,
//            {autoCommit: true},
//            function (err, result) {
//                if (err) {
//                    executeError(err, res);
//                } else {
//                 //    console.log(util.inspect(result, {showHidden: false, depth: null}));
//                    res.send({success: true, results: result.rows});
//                 }
//                 doRelease(connection);
//             }
//         );
//     });
// });


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
                            // console.log(result.rows[0][0]);
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

app.route("/displayGroup")
    .get(function(req, res){
        var DBQueryString =
               "SELECT * " +
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
               "VALUES (:group_id, :user_name, :date_added, :notice)" ,
               DBQueryParam = {group_id: req.body.group_id, user_name: req.body.user_name, date_added: null, notice: null};

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
    var DBQueryStringList =
        "DELETE from GROUP_LISTS "+
        "WHERE group_id = :group_id; ";

    var DBQueryStringGroup =
        "DELETE from GROUPS " +
        "WHERE group_id = :group_id; ";

    var DBQueryParam = {group_id: req.body.group_id};

    DBQueryTotal = "BEGIN\n" +DBQueryStringList + DBQueryStringGroup + "END;";

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
            "VALUES (:groupID, :userName, :groupName, :date_created); " +

            "INSERT INTO GROUP_LISTS (GROUP_ID, FRIEND_ID, DATE_ADDED, NOTICE) " +
            "VALUES (:groupID, :userName, :date_created, :notice); " +

            "END;",
            DBQueryParam = {groupID: req.body.groupID,
                            userName: req.body.userName,
                            groupName: req.body.groupName,
                            date_created: null,
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
            date = null;

            // Need to find how to calculate the current datestamp
            DBQueryStringUsers =
            "INSERT INTO users " +
            "(USER_NAME, PASSWORD, DATE_REGISTERED) " +
            "VALUES (:username, :password, :date); ";

            DBQueryStringPersons =
            "INSERT INTO persons " +
            "(USER_NAME, FIRST_NAME, LAST_NAME, ADDRESS, EMAIL, PHONE) " +
            "VALUES (:username, :first_name, :last_name, :address, :email, :phone); ";

            DBQueryTotal = "BEGIN\n" +DBQueryStringUsers + DBQueryStringPersons + "END;";

            // Need to put the parameters in here
            DBQueryParam = {username: username,
                                  password: password,
                                  date: date,
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
