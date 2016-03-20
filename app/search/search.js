angular.module("myApp.search", ["ngRoute", "LocalStorageModule"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/search", {
        templateUrl: "search/search.html",
        controller: "searchController"
    });
}])

.controller("searchController", function($scope, $location, localStorageService) {
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
