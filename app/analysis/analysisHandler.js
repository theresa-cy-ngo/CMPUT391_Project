var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.analysis.analysisHandler", [])
.service("analysisHandler", function($http, $q) {
    this.analysis = function (username, subject, timeStart, timeEnd, timeframe, callback) {
        $http({
            url: SERVICE_BASE_URL + "analysis",
            method: "POST",
            data: {username: username, subject: subject, timeStart: timeStart, timeEnd: timeEnd, timeframe: timeframe}
        })
        .then(function(result) {
            return callback(result);
        },
        function(result) { // optional
            return callback(result);
        });
    };

});
