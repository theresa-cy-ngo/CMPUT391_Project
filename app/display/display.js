angular.module("myApp.display", ["ngRoute", "LocalStorageModule"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/display", {
        templateUrl: "display/display.html",
        controller: "displayController"
    });
}])

.controller("displayController", function($scope, $location, localStorageService) {
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
