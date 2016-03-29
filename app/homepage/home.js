angular.module("myApp.home", ["ngRoute", "LocalStorageModule"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/home", {
        templateUrl: "homepage/home.html",
        controller: "HomeController"
    });
}])

.controller("HomeController", function($scope, $location, $route, localStorageService) {
    var usernameFromStorage,
        storageKey = "user";

    // Hide the dataAnalysis button
    $scope.dataAnalysis = false;

    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    }else{
        usernameFromStorage = getItem(storageKey);
    }

    // If the username is "admin", show the button
    if (usernameFromStorage == "admin"){
      $scope.dataAnalysis = true;
    }

    $scope.groups = function() {
    	$location.url("/groups");
    };
    $scope.display = function() {
    	$location.url("/display");
    };
    $scope.search = function() {
    	$location.url("/search");
    };
    $scope.analysis = function() {
    	$location.url("/analysis");
    };
    $scope.upload = function () {
      $location.url("/upload");
    };

    $scope.logout = function () {
      localStorageService.clearAll();
      $route.reload();
    };


});
