angular.module("myApp.analysis", ["ngRoute", "LocalStorageModule", "myApp.analysis.analysisHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/analysis", {
        templateUrl: "analysis/analysis.html",
        controller: "analysisController"
    });
}])

.controller("analysisController", function($scope, $location, localStorageService, analysisHandler) {
    var usernameFromStorage,
        storageKey = "user";

    $scope.table = [];
    $scope.resultTable = false;

    var months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];

    function getItem(key) {
        return localStorageService.get(key);
    };

    if(!getItem(storageKey)){
        //User has not logged in yet so redirect to login
        $location.url("/login");
    } else {
        usernameFromStorage = getItem(storageKey);
    }

    // Changes the format of the date so that it can be searched in the database
    function formatDate(date, placement) {
        if (placement == 1) {
          date.setDate(date.getDate() + 1);
        }
        var dd = date.getDate(),
            mm = date.getMonth()+1,
            yyyy = date.getFullYear(),
            dateString = ""
        if(dd<10){
            dd='0'+dd
        }
        if(mm<10){
            mm='0'+mm
        }
        dateString = yyyy + "/" + mm + "/" + dd
        return dateString
    };

    function formatDateResult(date, timeframe) {
        format = date.split("-");
        if (timeframe == "monthly") {
            result = months[parseInt(format[1], 10)-1] + ", " + format[0];
        } else if (timeframe == "weekly") {
            result = months[parseInt(format[1], 10)-1] + " " + parseInt(format[2], 10) + ", " + format[0];
        };
        return result;
    }

    $scope.generate = function() {
        var timeframe = $scope.timeframe,
            username = $scope.checkUser,
            subject = $scope.checkSubject,
            timeStart = $scope.analyseTimeBegin,
            timeEnd = $scope.analyseTimeEnd;

        // Check that both time variables are added if needed
        if ((timeStart && !timeEnd) || (!timeStart && timeEnd)){
            alert("Please enter a start and end date.");
        } else {
            $scope.table = [];
            $scope.dateHeader = "";

            if (timeStart && timeEnd){
                timeStart = formatDate(timeStart, 0);
                timeEnd = formatDate(timeEnd, 1);
            };

            if (timeframe == "none") {
                $scope.dateHeader = "";
            } else if (timeframe == "weekly") {
                $scope.dateHeader = "Week Starting On";
            } else if (timeframe == "monthly") {
                $scope.dateHeader = "Month";
            } else if (timeframe == "yearly") {
                $scope.dateHeader = "Year";
            };

            analysisHandler.analysis(username, subject, timeStart, timeEnd, timeframe, function(result){
                var index = 0;
                res = result.data.results;

                for (index; index < result.data.results.length; index++) {
                    if (timeframe == "none") {
                        $scope.table.push({"date": "Total","number": res[index][0]});
                    } else {
                        if (res[index][0]){
                            if (timeframe == "weekly") {
                                formatWeek = formatDateResult(res[index][0], timeframe);
                                $scope.table.push({"date": formatWeek,"number": res[index][1]});
                            } else if (timeframe == "monthly") {
                                formatMon = formatDateResult(res[index][0], timeframe);
                                $scope.table.push({"date": formatMon, "number": res[index][1]});
                            } else if (timeframe == "yearly") {
                                $scope.table.push({"date": res[index][0],"number": res[index][1]});
                            };
                        };
                    }
                }
                $scope.resultTable = true;
            });
        }
    };
});
