var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.upload.uploadHandler", [])
.service("uploadHandler", function($http, $q) {
    this.uploadFile = function(requestBody, callback){

        $http({
            url: SERVICE_BASE_URL + "upload",
            method: "POST",
            data: requestBody
        })
        .then(function(result) {
            return callback(result);
        },
        function(result) { // optional
            return callback(result);
        });
    };

    this.getID = function(callback){
      $http({
          url: SERVICE_BASE_URL + "photoid",
          method: "POST"
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) { // optional
          return callback(result);
      });
    };

    this.showFile = function(photoid, callback){
        $http({
            url: SERVICE_BASE_URL + "upload",
            method: "GET",
            params: {id: 6}
        })
        .then(function(result) {
            return callback(result);
        },
        function(result) { // optional
            return callback(result);
        });
    };

});
