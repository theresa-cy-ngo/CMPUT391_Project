var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.register.registerHandler", [])
.service("registerHandler", function($http, $q) {
  this.register = function (username, password, fname, lname, addr, email, phone, callback) {
      var $regpost = $http({
            method: 'POST',
            url: SERVICE_BASE_URL + "register",
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: {userName: username, password: password, fname: fname,
                  lname: lname, addr: addr, email: email, phone: phone, date: null}
        }).success(function (result) {
            return callback(result);
        }).error(function (result) {
            return callback(result);
        });
  };

  this.check = function(username, email, callback) {
    var $checkpost = $http({
          method: 'GET',
          url: SERVICE_BASE_URL + "register",
          params: {userName: username, email: email},
      }).success(function (result) {
          return callback(result);
      }).error(function (result) {
          return callback(result);
      });

  };

});
