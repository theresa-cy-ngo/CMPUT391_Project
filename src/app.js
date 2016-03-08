var SERVICE_BASE_URL = "http://localhost:8080/";

angular.module('loginModule', [])
  .controller('loginController', function($scope, $http){
    $scope.submit = function () {
      console.log("clicked");
      fetch();
    }
    function fetch(){
      $http({
          method: 'POST',
          url: SERVICE_BASE_URL + "login",
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
              var str = [];
              for(var p in obj)
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
              return str.join("&");
          },
          data: {userName: $scope.usernameInput, password: $scope.passwordInput}
      }).success(function (result) {
          console.log("success " + result.success);
      }).error(function (result) {
          console.log("error "+ result.success);
      });
    }
  });
