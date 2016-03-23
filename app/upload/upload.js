angular.module("myApp.upload", ["ngRoute", "LocalStorageModule", "myApp.upload.uploadHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/upload", {
        templateUrl: "upload/upload.html",
        controller: "uploadController"
    });
}])

.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])

.controller("uploadController", function($scope, $location, localStorageService, uploadHandler) {
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

    $scope.uploadFile = function(){
       var file = $scope.myFile;
    //    console.log('file is ' );
    //    console.dir(file);

      // var data_blob = new Blob([file]);
       var reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onloadend = function() {
        var base64data = reader.result;
        console.log(base64data);
        uploadHandler.uploadFile(base64data, function(result){
            console.log("RESULT FROM INSERT IS " + result);
        });
       }


       //var uploadUrl = "/fileUpload";
       //uploadHandler.uploadFileToUrl(file, uploadUrl);
   };
});
