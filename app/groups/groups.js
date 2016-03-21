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

    $scope.groups = [];

    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    }else{
        usernameFromStorage = getItem(storageKey);
    }

    groupsHandler.getGroups(usernameFromStorage, function(result){
        var index = 0;

        for(index; index < result.data.results.length; index++){
            $scope.groups.push({"name": result.data.results[index][2], "id": result.data.results[index][0]});
        }
        // console.log(result);
    });

    $scope.getSelected = function(group) {
        console.log(group);
        $location.url("/displaygroups");
    };

    $scope.addGroup = function () {
        if($scope.regGroupName){
            //need to add to db

            groupsHandler.getID(function(result) {
                if(result.data.success){
                    groupsHandler.addGroup(result.data.lastID + 1, $scope.regGroupName, usernameFromStorage, function(){
                        if(result.data.success){
                            // console.log("added");
                            $scope.groups.push({"name": $scope.regGroupName, "id": result.data.lastID + 1});
                        }else{
                            alert("Error adding group. Please try again.");
                        }
                    });
                }else{
                    alert("Error adding group. Please try again.");
                }
        	});


            // $scope.groups.push({"name": $scope.regGroupName});
        }else{
            alert("Enter a group name");
        }

    };



});
