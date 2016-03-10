// Declare app level module which depends on views, and components
angular.module("myApp", [
    "ngRoute",
    "myApp.login",
    "myApp.home"
]).
config(["$routeProvider", function($routeProvider) {
    $routeProvider.otherwise({redirectTo: "/login"});
}]);
