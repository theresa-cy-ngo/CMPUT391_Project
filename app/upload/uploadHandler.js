var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.upload.uploadHandler", [])
.service("uploadHandler", function($http, $q) {
    this.uploadFile = function(photoData, thumbnailData callback){
        var requestBody = {};
        var data = imagedata.slice(13);
        requestBody = {
            id: 4,
            description: "description",
            data: photoData,
            thumbnail: thumbnailData,
            date: null
        };

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
