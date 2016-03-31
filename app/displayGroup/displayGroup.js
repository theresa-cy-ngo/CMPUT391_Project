angular.module("myApp.displayGroups", ["ngRoute", "LocalStorageModule", "myApp.groups.groupsHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/displayGroup", {
        templateUrl: "displayGroup/displayGroup.html",
        controller: "displaygroupsController"
    });
}])

.controller("displaygroupsController", function($scope, $location, localStorageService, groupsHandler) {
    var usernameFromStorage,
        storageKey = "user",
        selected_group = groupsHandler.curr_group;

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

    function getMembers(groupID) {
        groupsHandler.getMembers(groupID, function(result){
            var index = 0;
            if(result.data.success){
              console.log(result.data)
                for(index; index < result.data.results.length; index++){
                    date_added = result.data.results[index][1];
                    var date_var = new Date(date_added)
                    var date_string = date_var.toDateString();
                    $scope.groups.push({"name": result.data.results[index][0], "date": date_string});
                }
                console.log($scope.groups);
            }else{
                alert("Error loading group. Please try again.");
            }
        })
    };

    if(!selected_group){
        $location.url("/groups");
    }else{
        console.log(selected_group);
        $scope.group_name = selected_group.name;
        // $scope.groups = [];
        getMembers(selected_group.id);
        // console.log($scope.groups);
    }

    function getFormattedDate () {
        var today = new Date(),
            formattedDate,
            month,
            weekday,
            day,
            year,
            monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
            daysOfWeek = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];

        month = monthNames[today.getMonth()];
        weekday = daysOfWeek[today.getDay()];
        day = today.getDate();
        year = today.getFullYear();

        formattedDate = weekday + " " + month + " " + day + " " + year;

        return formattedDate;

    };

    $scope.addMember = function () {
        if($scope.addMemberName){
            groupsHandler.addMember(selected_group.id, $scope.addMemberName, function(result){
                var currentDate = getFormattedDate();

                if(result.data.success){
                    console.log(result.data);
                    $scope.groups.push({"name": $scope.addMemberName, "date": currentDate});
                }else{
                    alert("Error adding member. Please try again with a valid username.");
                }
            });
        }else{
            alert("Please type a valid username to be added");
        }
    };

    $scope.removeMember = function () {
        if($scope.removeMemberName){
            groupsHandler.deleteMember(selected_group.id, $scope.removeMemberName, function(result){
                if(result.data.success){
                    $scope.groups.splice(_.indexOf($scope.groups, _.findWhere($scope.groups, { "name" : $scope.removeMemberName})), 1);
                }else{
                    alert("Error deleting member. Please try again with a valid username.");
                }
            });
        }else{
            alert("Please type a valid username to be added");
        }
    };

    $scope.deleteGroup = function() {
      groupsHandler.deleteGroup(selected_group.id, function(result){
        if(result.data.success){
          // Need to redirect to the main group page
          alert("Deleted group.");
          $location.url("/groups");
        } else {
          alert("Error deleting group.");
        }
      })
    };


});
