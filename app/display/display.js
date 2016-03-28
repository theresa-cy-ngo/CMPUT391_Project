angular.module("myApp.display", ["ngRoute", "LocalStorageModule", "myApp.display.displayHandler", "jkuri.gallery"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/display", {
        templateUrl: "display/display.html",
        controller: "displayController"
    });
}])

.controller("displayController", function($scope, $location, localStorageService, displayHandler) {
    var usernameFromStorage,
        storageKey = "user";

    // Initializes array of pictures
    $scope.myPictures = [];
    $scope.groupPictures = [];
    $scope.popularPictures = [];

    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    }else{
        usernameFromStorage = getItem(storageKey);
    }

    function parseImageResult (result){
       var photo = result.slice(7, result.length-2);
       //console.log(photo);
       return photo;
    };

    function parseThumbResult (result){
       var thumb = result.slice(8, result.length-2);
       //console.log(thumb);
       return thumb;
    };

    // Gets the gallery for the user's uploaded images
    displayHandler.getPictures(usernameFromStorage, function(result){
        var index = 0;
        if (result.data.images) {
            for (index; index < result.data.images.length; index++){
                var image = new Image(),
                    photoString = result.data.images[index],
                    photo = parseImageResult(photoString);
                var imageThumb = new Image(),
                    thumbString = result.data.thumbs[index],
                    thumb = parseThumbResult(thumbString);

                image.src = "data:image/png;base64," + photo;
                imageThumb.src = "data:image/png;base64," + thumb;
                $scope.myPictures.push({thumb: image.src, img: image.src, description: result.data.rows[index][3]})
            }
        };
    });

    // Retrieves the gallery for the user's group and public images
    displayHandler.getGroupPictures(usernameFromStorage, function(result){
        var index = 0;
        if (result.data.images) {
            for (index; index < result.data.images.length; index++){
                var image = new Image(),
                    photoString = result.data.images[index],
                    photo = parseImageResult(photoString);
                var imageThumb = new Image(),
                    thumbString = result.data.thumbs[index],
                    thumb = parseThumbResult(thumbString);

                image.src = "data:image/png;base64," + photo;
                imageThumb.src = "data:image/png;base64," + thumb;
                $scope.groupPictures.push({thumb: image.src, img: image.src, description: result.data.rows[index][3]})
            }
        };
    });

});
