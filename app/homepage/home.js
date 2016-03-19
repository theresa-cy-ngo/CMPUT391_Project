angular.module("myApp.home", ["ngRoute", "LocalStorageModule"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/home", {
        templateUrl: "homepage/home.html",
        controller: "HomeController"
    });
}])

.controller("HomeController", function($scope, $location, localStorageService) {
    var usernameFromStorage,
        storageKey = "user";

    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    }



});
