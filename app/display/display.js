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
    // displayHandler.getPictures(usernameFromStorage, function(result){
    //     var index = 0;
    //     var myGalleryImage = new Image(),
    //         myPhotoString,
    //         myPhoto;
    //     var myGalleryImageThumb = new Image(),
    //         myThumbString,
    //         myThumb;
    //
    //     if (result.data.data) {
    //         for (index; index < result.data.data.length; index++){
    //             myPhotoString = result.data.data[index][8],
    //             myPhoto = parseImageResult(myPhotoString);
    //             myThumbString = result.data.data[index][7],
    //             myThumb = parseThumbResult(myThumbString);
    //
    //             myGalleryImage.src = "data:image/png;base64," + myPhoto;
    //             myGalleryImageThumb.src = "data:image/png;base64," + myThumb;
    //             $scope.myPictures[index] = {thumb: myGalleryImageThumb.src, img: myGalleryImage.src, description: result.data.data[index][3]};
    //         }
    //     };
    // });

    // Retrieves the gallery for the user's group and public images
    displayHandler.getGroupPictures(usernameFromStorage, function(result){
        var index = 0;
        var groupImageArray = [],
            groupPhotoString = [],
            groupPhoto = [];
        var groupImageThumbArray = [],
            groupThumbString = [],
            groupThumb = [];

        // if (result.data.data) {
            console.log(result)
            for (index; index < result.data.data.length; index++){
                groupPhotoString[index] = result.data.data[index][8],
                groupPhoto[index] = parseImageResult(groupPhotoString[index]);
                groupThumbString[index] = result.data.data[index][7],
                groupThumb[index] = parseThumbResult(groupThumbString[index]);

                groupImageArray[index] = new Image();
                groupImageArray[index].src = "data:image/png;base64," + groupPhoto[index];
                groupImageThumbArray[index] = new Image();
                groupImageThumbArray[index].src = "data:image/png;base64," + groupThumb[index];
                $scope.groupPictures[index] = {thumb: groupImageThumbArray[index].src, img: groupImageArray[index].src, description: result.data.data[index][3]};
            }
        // };
    });

    // $scope.myPictures = [
    // {thumb: 'images/thumbs/1.jpg', img: 'images/1.jpg', description: 'Subject: fkdsj;afljdlka, Location: jfklsajklf;jdsaljdflkas, Description: fdksl;ajlfdjslajfdklsj;'},
    // {thumb: 'images/thumbs/2.jpg', img: 'images/2.jpg', description: 'Image 2'},
    // {thumb: 'images/thumbs/3.jpg', img: 'images/3.jpg', description: 'Image 3'},
    // {thumb: 'images/thumbs/4.jpg', img: 'images/4.jpg', description: 'Image 4'}
    // ];
    // displayHandler.getPictures(usernameFromStorage, function(result){
    //     console.log(result.data.results);
    //
    // });

    // displayHandler.getGroupPictures(usernameFromStorage, function(result){
    //     console.log(result.data.results)
    // });
    //
    // displayHandler.getPopularPictures(usernameFromStorage, function(result){
    //     console.log(result.data.results)
    // });


});
