angular.module("myApp.upload", ["ngRoute","myApp.upload.uploadHandler"])

.config(['flowFactoryProvider', function (flowFactoryProvider) {
flowFactoryProvider.defaults = {
        target: '/upload',
        permanentErrors:[404, 500, 501]
}}])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/upload", {
        templateUrl: "upload/upload.html",
        controller: "UploadController"
    });
}])
// .directive('ngFiles', ['$parse', function ($parse) {
//
//     function fn_link(scope, element, attrs) {
//         var onChange = $parse(attrs.ngFiles);
//         element.on('change', function (event) {
//             onChange(scope, { $files: event.target.files });
//         });
//     };
//
//     return {
//         link: fn_link
//     }
// } ])
.controller("UploadController", function ($scope, uploadHandler) {
  $scope.imageStrings = [];
  $scope.processFiles = function(files){
    angular.forEach(files, function(flowFile, i){
       var fileReader = new FileReader();
          fileReader.onload = function (event) {
            var uri = event.target.result;
              $scope.imageStrings[i] = uri;
              console.log(uri);
          };
          fileReader.readAsDataURL(flowFile.file);
          fileReader.onloadend = function(){
            var base64data = fileReader.result;
          }
    });
    console.log($scope.imageStrings);
  };});
    // $scope.submit = function(files) {
    //   var file_array = [];
    //   angular.forEach(files, function(flowFile, i){
    //     //console.log(flowFile);
    //     var file = flowFile.file;
    //     file_array.push(file);
    //     console.log(file);
    //   });
    //
    //   file_array.forEach(function(element, index, array) {
    //     // var blob_url = URL.createObjectURL(element);
    //     // console.log(blob_data)
    //   var data_blob = new Blob([element.preview]);
    //   var reader = new FileReader(element);
    //   //reader.readAsDataURL(data_blob);
    //   console.log(reader);
    //   reader.onloadend = function() {
    //     console.log(reader);
    //     var base64data = reader.result;
    //     console.log(base64data);
    //   }
    // });
    //   //  var fileReader = new FileReader();
    //   //  var binary = fileReader.readAsBinaryString(flowFile.file);
    //   //  console.log(binary);
    //   //     fileReader.onload = function (event) {
    //   //       var uri = event.target.result;
    //   //         imageStrings[i] = uri;
    //   //     };
    //   //     fileReader.readAsDataURL(flowFile.file);
    //   // );
    //   // console.log(imageStrings);
    //   // Dealing with the flow images
    //   // angular.forEach(flows, function (flow) {
    //   //         var fd = new FormData();
    //   //         fd.append("file", flow);
    //   //         $http.post("upload", fd, {
    //   //             withCredentials: true,
    //   //             headers: {'Content-Type': undefined },
    //   //             transformRequest: angular.identity
    //   //         })
    //   //     });
    //   // Flow.prototype.addExistingFile = function (file, event) {
    //   //   var f = new Flow.FlowFile(this, file);
    //   //   this.files.push(f);
    //   // };
    //
    //   // angular.forEach(flow_files, function(value, key) {
    //   //   var blob = new Blob(['pre_existing_image'], {type: value.image_content_type});
    //   //   blob.name = value.image.image_file_name;
    //   //   blob.image_url = value.image.image_url;
    //   //   blob.image_id = value.image.id;
    //   //   blob.alt_text = value.alt_text;
    //   //   blob.flow_files_id = value.id;
    //   //   flowObj.addExistingFile(blob);
    //   // });
    //
    //   if($scope.singleUpload && $scope.folderUpload){
    //       alert("Only single image OR folder upload.");
    //   } else {
    //     latest_id = uploadHandler.getId();
    //     console.log(latest_id);
        // uploadHandler.uploadImages($scope.imgUser, $scope.imgPermit,
        //                             $scope.imgSubject, $scope.imgLocation,
        //                             $scope.imgWhen, $scope.imgDesc,
        //                             function(result) {
        //                               console.log("RESULT " + result);
        //                               if(result.success){
        //                                 console.log("success");
        //                               }else{
        //                                 alert("Bleh");
        //                               }
        //                             })
    //   };};
    // });

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
