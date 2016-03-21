angular.module("myApp.displayGroups", ["ngRoute", "LocalStorageModule", "myApp.groups.groupsHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/displaygroups", {
        templateUrl: "groups/displayGroup/displayGroup.html",
        controller: "displaygroupsController"
    });
}])

.controller("displaygroupsController", function($scope, $location, localStorageService, groupsHandler) {
    var usernameFromStorage,
        storageKey = "user";

    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    }
    //
    // $scope.groups = [{"name": "test"}];
    //
    // $scope.getSelected = function() {
    //     console.log("clicked");
    // };
    //
    // $scope.addGroup = function () {
    //     if($scope.regGroupName){
    //         //need to add to db
    //         $scope.groups.push({"name": $scope.regGroupName});
    //     }else{
    //         alert("Enter a group name");
    //     }
    //
    // };



});
