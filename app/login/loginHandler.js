var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.login.loginHandler", [])
.service("loginHandler", function($http, $q) {
    this.login = function (username, password, callback) {
        var $loginpost = $http({
              method: 'POST',
              url: SERVICE_BASE_URL + "login",
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              transformRequest: function(obj) {
                  var str = [];
                  for(var p in obj)
                  str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                  return str.join("&");
              },
              data: {userName: username, password: password}
          }).success(function (result) {
              return callback(result);
          }).error(function (result) {
              return callback(result);
          });
    };

    this.logout = function() {

    };

});
