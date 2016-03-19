angular.module("myApp.login", ["ngRoute", "myApp.login.loginHandler", "LocalStorageModule"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/login", {
        templateUrl: "login/login.html",
        controller: "LoginController"
    });
}])

.controller("LoginController", function($scope, $location, loginHandler, localStorageService) {
    $scope.submit = function() {
    	loginHandler.login($scope.usernameInput, $scope.passwordInput, function(result) {
        if(result.success){
            localStorageService.set("user", $scope.usernameInput);
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
