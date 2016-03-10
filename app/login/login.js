angular.module("myApp.login", ["ngRoute", "myApp.login.loginHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/login", {
        templateUrl: "login/login.html",
        controller: "LoginController"
    });
}])

.controller("LoginController", function($scope, $location, loginHandler) {
    $scope.submit = function() {
    	loginHandler.login($scope.usernameInput, $scope.passwordInput, function(result) {

        console.log("RESULT " + result);
        if(result.success){
          console.log("success");
          $location.url("/home");
        }else{
          alert("No account data");
        }

    	});
    };
});
