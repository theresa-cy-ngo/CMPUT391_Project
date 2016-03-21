var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.groups.groupsHandler", [])
.service("groupsHandler", function($http, $q) {
    this.getID = function (callback) {
        $http({
            url: SERVICE_BASE_URL + "groupid",
            method: "POST"
        })
        .then(function(result) {
            return callback(result);
        },
        function(result) { // optional
            return callback(result);
        });
    };

    this.addGroup = function (groupID, groupName, userName, callback) {
        console.log("handler " + groupID, groupName, userName);
        $http({
            url: SERVICE_BASE_URL + "groups",
            method: "POST",
            data: {groupID: groupID, userName: userName, groupName: groupName, date: null}
        })
        .then(function(result) {
            return callback(result);
        },
        function(result) { // optional
            return callback(result);
        });
    };

    this.getGroups = function (username, callback) {
        $http({
            url: SERVICE_BASE_URL + "groups",
            method: "GET",
            params: {userName: username}
        })
        .then(function(result) {
            return callback(result);
        },
        function(result) { // optional
            return callback(result);
        });
    };

});
