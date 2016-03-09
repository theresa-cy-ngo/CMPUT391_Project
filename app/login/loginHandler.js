var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.login.loginHandler", [])
.service("loginHandler", function($http, $q) {
    this.loginWatchers = [];

    this.login = function (username, password) {
        return ($loginpost = $http({
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
              console.log("success " + result.success);
          }).error(function (result) {
              console.log("error "+ result.success);
          }));
    };

    this.logout = function() {
        // //Keep this wrapped in 'q' just to keep everything consistent.
        // return $q(function(resolve/*, reject*/) {
        //     // $httpProvider.defaults.headers.common.Authorization = undefined;
        //     this.loginWatchers.forEach(function(f) {
        //         f(false);
        //     });
        //     resolve();
        // }.bind(this));
    };

    this.watchLogin = function(callback) {
        this.loginWatchers.push(callback);
    };
});
