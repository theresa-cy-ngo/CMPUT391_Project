angular.module("myApp.analysis", ["ngRoute", "LocalStorageModule"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/analysis", {
        templateUrl: "analysis/analysis.html",
        controller: "analysisController"
    });
}])

.controller("analysisController", function($scope, $location, localStorageService) {
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
