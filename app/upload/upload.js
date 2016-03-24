angular.module("myApp.upload", ["ngRoute", "LocalStorageModule", "myApp.upload.uploadHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/upload", {
        templateUrl: "upload/upload.html",
        controller: "uploadController"
    });
}])

//Based on code found here: https://jsfiddle.net/JeJenny/ZG9re/
//And here: https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
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

    //Based on code found here: http://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload
    function dataURLToBlob (dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }

    //Based on code found here: https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
    function resizeToThumbnail(photoData) {
        var img = document.createElement("img");
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        img.src = photoData;
        ctx.drawImage(img, 0, 0);

        var MAX_WIDTH = 200;
        var MAX_HEIGHT = 200;
        var width = img.width;
        var height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        var dataUrl = canvas.toDataURL('image/jpeg');
        var resizedImage = dataURLToBlob(dataUrl);

        return dataUrl;
    };

    $scope.uploadFile = function(){
       var  file = $scope.myFile,
            reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onloadend = function(e) {
         var  photoData = reader.result,
              thumbnailData = resizeToThumbnail(base64data);

        // var image = new Image();
        // image.src = thumbnailData;
        // document.body.appendChild(image);

         uploadHandler.uploadFile(photoData, thumbnailData, function(result){
            // console.log("RESULT FROM INSERT IS " + result);
            alert("uploaded file");
          });
       }


       //var uploadUrl = "/fileUpload";
       //uploadHandler.uploadFileToUrl(file, uploadUrl);
   };

   function parseResult (result){

    var photo = result.slice(7, result.length-2);
    console.log(photo);
    return photo;

   };

   $scope.showFile = function () {
       uploadHandler.showFile(6, function(result){
           var  image = new Image(),
                photoString = result.data.data[0][8],
                photo = parseResult(photoString);
        //    console.log(photo);
           image.src = "data:image/png;base64," + photo;
        //    console.log(image.src);
           document.body.appendChild(image);

        //    parseResult(result);
       });

    // var image = new Image();
    // image.src = "data:image/png;base64," + photo;
    // document.body.appendChild(image);


   };
});
