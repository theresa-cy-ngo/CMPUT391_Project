var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.upload.uploadHandler", [])
.service("uploadHandler", function($http, $q) {
    this.uploadFile = function(imagedata, callback){
        var requestBody = {};
        var data = imagedata.slice(13);
        requestBody = {
            id: 4,
            description: "description",
            data: data,
            thumbnail: data,
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

});
