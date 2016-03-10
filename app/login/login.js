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
        if(result.success){
          $location.url("/home");
        }else{
          alert("No account data");
        }
    	});
    };

    $scope.register = function() {
    	$location.url("/register");
    };
});
