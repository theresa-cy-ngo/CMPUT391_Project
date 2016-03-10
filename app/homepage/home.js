angular.module("myApp.home", ["ngRoute"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/home", {
        templateUrl: "homepage/home.html",
        controller: "HomeController"
    });
}])

.controller("HomeController", function($scope, $location, loginHandler) {
    console.log("homecontr");
});
