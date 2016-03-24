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
    //$scope.myPictures = [];
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

    $scope.myPictures = [
    {thumb: 'images/thumbs/1.jpg', img: 'images/1.jpg', description: 'Subject: fkdsj;afljdlka, Location: jfklsajklf;jdsaljdflkas, Description: fdksl;ajlfdjslajfdklsj;'},
    {thumb: 'images/thumbs/2.jpg', img: 'images/2.jpg', description: 'Image 2'},
    {thumb: 'images/thumbs/3.jpg', img: 'images/3.jpg', description: 'Image 3'},
    {thumb: 'images/thumbs/4.jpg', img: 'images/4.jpg', description: 'Image 4'}
    ];
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
