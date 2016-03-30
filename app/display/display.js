angular.module("myApp.display", ["ngRoute", "LocalStorageModule", "myApp.display.displayHandler", "jkuri.gallery"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/display", {
        templateUrl: "display/display.html",
        controller: "displayController"
    });
}])

.controller("displayController", function($scope, $location, localStorageService, displayHandler) {
    var usernameFromStorage,
        storageKey = "user",
        currentImage;

    // Initializes array of pictures
    $scope.myPictures = [];
    $scope.groupPictures = [];
    $scope.popularPictures = [];
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

    $scope.editPhoto = function(){
        displayHandler.curr_image = currentImage;
        $location.url("/edit");
    }

    $scope.showImageDetails = function (selectedImage){
        $scope.selected = selectedImage;
        currentImage = selectedImage;
        displayHandler.checkTracking(usernameFromStorage, currentImage.id, function(result){
            if (!result.data.results[0]) {
                displayHandler.updateTracking(usernameFromStorage, currentImage.id, function(result){
                    console.log("Update complete");
                });
            } else {
                console.log("Data is already in the system");
            };
        });
    };


    getImageSrc = function (photoBase64) {
        var gifString = "R0lGOD", //The base 64 representation of a Gif start with this string
            pngString = "iVBORw",
            photoString = photoBase64.substring(7,13),
            formattedPhoto,
            imageSrc;

        if(photoString == gifString || photoString == pngString){
            //photo is a gif
            formattedPhoto = photoBase64.slice(7, photoBase64.length-2)
            imageSrc = "data:image/gif;base64," + formattedPhoto;
        }else {
            //photo is a jpeg
            formattedPhoto = photoBase64.slice(8, photoBase64.length-2)
            imageSrc = "data:image/jpeg;base64," + formattedPhoto;
        }

        return imageSrc;

    };


    // Gets the gallery for the user's uploaded images
    displayHandler.getPictures(usernameFromStorage, function(result){
        var index = 0;
        if (result.data.images) {
            for (index; index < result.data.images.length; index++){
                var image = new Image(),
                    photoString = result.data.images[index];
                var imageThumb = new Image(),
                    thumbString = result.data.thumbs[index];

                image.src = getImageSrc(photoString);
                imageThumb.src = getImageSrc(thumbString);

                $scope.myPictures.push({src: image.src,
                                        id: result.data.rows[index][0],
                                        owner: result.data.rows[index][1],
                                        permit: result.data.rows[index][2],
                                        subject: result.data.rows[index][3],
                                        place: result.data.rows[index][4],
                                        timing: result.data.rows[index][5],
                                        desc: result.data.rows[index][6]
                                      });
            }
        };
    });

    // Retrieves the gallery for the user's group and public images
    displayHandler.getGroupPictures(usernameFromStorage, function(result){
        var index = 0;
        if (result.data.images) {
            for (index; index < result.data.images.length; index++){
                var image = new Image(),
                    photoString = result.data.images[index];
                var imageThumb = new Image(),
                    thumbString = result.data.thumbs[index];

                image.src = getImageSrc(photoString);
                imageThumb.src = getImageSrc(thumbString);
                // $scope.groupPictures.push({thumb: image.src, img: image.src, description: result.data.rows[index][3]})
                $scope.groupPictures.push({src: image.src,
                                        id: result.data.rows[index][0],
                                        owner: result.data.rows[index][1],
                                        permit: result.data.rows[index][2],
                                        subject: result.data.rows[index][3],
                                        place: result.data.rows[index][4],
                                        timing: result.data.rows[index][5],
                                        desc: result.data.rows[index][6]
                                      });

            }
        };
    });

});
