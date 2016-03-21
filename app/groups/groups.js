angular.module("myApp.groups", ["ngRoute", "LocalStorageModule", "myApp.groups.groupsHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/groups", {
        templateUrl: "groups/groups.html",
        controller: "groupsController"
    });
}])

.controller("groupsController", function($scope, $location, localStorageService, groupsHandler) {
    var usernameFromStorage,
        storageKey = "user";

    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    }

    $scope.groups = [{"name": "test"}];

    $scope.getSelected = function() {
        $location.url("/displaygroups");
    };

    $scope.addGroup = function () {
        if($scope.regGroupName){
            //need to add to db
            $scope.groups.push({"name": $scope.regGroupName});
        }else{
            alert("Enter a group name");
        }

    };



});
