// Declare app level module which depends on views, and components
angular.module("myApp", ['flow',
    "ngRoute",
    "myApp.login",
    "myApp.home",
    "myApp.upload",
]).

config(["$routeProvider", function($routeProvider) {
    $routeProvider.otherwise({redirectTo: "/upload"});
}]);
