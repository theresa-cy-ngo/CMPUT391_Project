angular.module("myApp.upload", ["ngRoute","myApp.upload.uploadHandler"])

// Might not need this part
.config(['flowFactoryProvider', function (flowFactoryProvider) {
flowFactoryProvider.defaults = {
        target: '/upload',
        permanentErrors:[404, 500, 501]
}}])

// Configures the route for uploads
.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/upload", {
        templateUrl: "upload/upload.html",
        controller: "UploadController"
    });
}])

// Controller
// Deals with methods called from the view and sends the information to the backend
.controller("UploadController", function ($scope, uploadHandler, $q) {

  // Initialize array of image blobs
  var imageStrings = [];

  // Show the submit button
  $scope.submitButton = true;

  function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

  // Reads all of the image files as a blob and adds it to imageStrings
  $scope.processFiles = function(files){
    var processFile = function () {
        var deferred = $q.defer();

        // Hide the submit button
        $scope.submitButton = false;

        angular.forEach(files, function(flowFile, i){
            var fileReader = new FileReader();
            //fileReader.readAsDataURL(flowFile.file);
            fileReader.onload = function (event) {
                //console.log(flowFile.file);
                var uri = event.target.result;
                var blob = b64toBlob(uri, contentType);
                imageStrings[i] = blob;
                // var img = new Image;
                // img.onload = function(event) {
                //   img.src = event.result
                //   console.log(img.width);
                // };
                deferred.resolve();
            };
        });
        return deferred.promise;
    };

    // Sets a promise that the uploads will not happen unless all images are
    // in the imageStrings array
    var promise = processFile();
    promise.then(function(){
        console.log(imageStrings);

        // Show the submit button again
        $scope.submitButton = true;

    }, function (err) {
        console.log("NOPE");
    });

// THUMBNAILS, UPLOADING STUFF, AND ASSIGNING PHOTO IDS!!!!
  };

  // Submits all the information to the database
  $scope.submit = function(files) {
      // var owner_name = $scope.imgUser;
      // var permitted = $scope.imgPermit;
      // var subject = $scope.imgSubject;
      // var place = $scope.imgLocation;
      // var timing = $scope.imgWhen;
      // var description = $scope.imgDesc;
      if($scope.singleUpload && $scope.folderUpload){
            alert("Only single image OR folder upload.");
        } else {
          latest_id = uploadHandler.getId($scope.imgUser, $scope.imgPermit,
                                      $scope.imgSubject, $scope.imgLocation,
                                      $scope.imgWhen, $scope.imgDesc, imageStrings,
                                      function(result) {
                                        console.log("RESULT " + result);
                                        if(result.success){
                                          console.log("success");
                                        }else{
                                          alert("nope")
                                        }
                                      });

          // Currently enters a blank thumbnail

          // uploadHandler.uploadImages($scope.imgUser, $scope.imgPermit,
          //                             $scope.imgSubject, $scope.imgLocation,
          //                             $scope.imgWhen, $scope.imgDesc,
          //                             function(result) {
          //                               console.log("RESULT " + result);
          //                               if(result.success){
          //                                 console.log("success");
          //                               }else{
          //                                 alert("Bleh")
          //                               }
          //                             });
    }};
});

    //
    //   if($scope.singleUpload && $scope.folderUpload){
    //       alert("Only single image OR folder upload.");
    //   } else {
    //     latest_id = uploadHandler.getId();
    //     console.log(latest_id);
    //     uploadHandler.uploadImages($scope.imgUser, $scope.imgPermit,
    //                                 $scope.imgSubject, $scope.imgLocation,
    //                                 $scope.imgWhen, $scope.imgDesc,
    //                                 function(result) {
    //                                   console.log("RESULT " + result);
    //                                   if(result.success){
    //                                     console.log("success");
    //                                   }else{
    //                                     alert("Bleh");
    //                                   }
    //                                 })
    //   };};
    // });
    //
    // var formdata = new FormData();
    // $scope.getTheFiles = function ($files) {
    //     angular.forEach($files, function (value, key) {
    //         formdata.append(key, value);
    //     });
    // };
    //
    // // NOW UPLOAD THE FILES.
    // $scope.uploadFiles = function () {
    //
    //     var request = {
    //         method: 'POST',
    //         url: '/api/fileupload/',
    //         data: formdata,
    //         headers: {
    //             'Content-Type': undefined
    //         }
    //     };
    //
    //     // SEND THE FILES.
    //     $http(request)
    //         .success(function (d) {
    //             alert(d);
    //         })
    //         .error(function () {
    //         });
    // }
