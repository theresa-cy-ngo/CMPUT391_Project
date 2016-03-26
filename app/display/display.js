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

    displayHandler.getPictures(usernameFromStorage, function(result){
        var index = 0;
        for (index; index < result.data.data.length; index++){
            var  image = new Image(),
                 photoString = result.data.data[index][8],
                 photo = parseImageResult(photoString);
            var imageThumb = new Image(),
                thumbString = result.data.data[index][7],
                thumb = parseThumbResult(thumbString);

            image.src = "data:image/png;base64," + photo;
            imageThumb.src = "data:image/png;base64," + thumb;
            $scope.myPictures.push({thumb: imageThumb.src, img: image.src, description: result.data.data[index][3]})
      }
        //document.body.appendChild(image);
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
