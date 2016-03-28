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
    // ** Need to make sure that the image passed through is actually called curr_image **

    // Initialize the page with the pre-existing values
    // May need to reformat this to format "yyyy/mm/dd" if original format doesn't work
    var imageDate = new Date(selected_image.timing);
    $scope.imgPerm = selected_image.permitted;
    $scope.imgSubject = selected_image.subject;
    $scope.imgLocation = selected_image.place;
    $scope.imgWhen = imageDate;
    $scope.imgDesc = selected_image.desc;


    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    }else{
        usernameFromStorage = getItem(storageKey);
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
    }

    $scope.editImage = function() {
        console.log("Editing image")

        var id = selected_image.id,
            permitted = $scope.imgPerm,
            subject = $scope.imgSubject,
            location = $scope.imgLocation,
            date = $scope.imgWhen,
            desc = $scope.imgDesc;

        date = formatDate(date);

        uploadHandler.uploadFile(id, permitted, subject, location, date, desc, function(result){
           alert("Edited Image");
        });

    };


});
