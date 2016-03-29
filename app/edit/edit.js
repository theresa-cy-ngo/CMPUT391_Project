angular.module("myApp.edit", ["ngRoute", "LocalStorageModule", "ngFileUpload", "myApp.display.displayHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/edit", {
        templateUrl: "edit/edit.html",
        controller: "editController"
    });
}])

.controller("editController", function($scope, $location, $q, localStorageService, displayHandler) {
    var usernameFromStorage,
        storageKey = "user",
        selected_image = displayHandler.curr_image;

    $scope.selected;

    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    }else{
        usernameFromStorage = getItem(storageKey);
    }

    if(!selected_image){
        $location.url("/display");
    }else {
        var imageDate = new Date(selected_image.timing);
        $scope.imgPerm = selected_image.permit;
        $scope.imgSubject = selected_image.subject;
        $scope.imgLocation = selected_image.place;
        $scope.imgWhen = imageDate;
        $scope.imgDesc = selected_image.desc;

        $scope.selected = selected_image;
    }

    // Formats the date to be put into the database
    function formatDate(date) {
        var dd = date.getDate(),
            mm = date.getMonth()+1,
            yyyy = date.getFullYear(),
            dateString = ""
        if(dd<10){
            dd='0'+dd
        }
        if(mm<10){
            mm='0'+mm
        }
        dateString = yyyy + "/" + mm + "/" + dd
        return dateString
    };


    $scope.editImage = function() {
        var requestBody = {
                photoid : selected_image.id,
                permit : $scope.imgPerm,
                subject : $scope.imgSubject,
                place : $scope.imgLocation,
                desc : $scope.imgDesc,
                timing : formatDate($scope.imgWhen)
            };

        displayHandler.editImage(requestBody, function(result){
            if(result.status !== 200){
              alert("Error trying to update. Please try again.")
            }else{
              alert("Edited Image");
            }
        });

    };


});
