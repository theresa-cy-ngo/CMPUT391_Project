angular.module("myApp.search", ["ngRoute", "LocalStorageModule", "myApp.search.searchHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/search", {
        templateUrl: "search/search.html",
        controller: "searchController"
    });
}])

.controller("searchController", function($scope, $location, localStorageService, searchHandler) {
    var usernameFromStorage,
        storageKey = "user";

    $scope.searchResults = [];

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

    displayResults = function (photoResults, rowResults) {
      var image = new Image(),
          photoString,
          photo;


        for(var i = 0; i < photoResults.length; i++){
            photoString = photoResults[i];

            image.src = getImageSrc(photoString);
            $scope.searchResults.push({src: image.src,
                                    id: rowResults[i][0],
                                    owner: rowResults[i][1],
                                    permit: rowResults[i][2],
                                    subject: rowResults[i][3],
                                    place: rowResults[i][4],
                                    timing: rowResults[i][5],
                                    desc: rowResults[i][6]
                                  });
        }


    };

    getImageSrc = function (photoBase64) {
        var gifString = "R0lGOD", //The base 64 representation of a Gif start with this string
            pngString = "iVBORw",
            photoString = photoBase64.substring(7,13),
            formattedPhoto,
            imageSrc;

        if(photoString == gifString || photoString == pngString){
            //photo is a gif
            formattedPhoto = photoBase64.slice(7, photoBase64.length-2)
            imageSrc = "data:image/gif;base64," + formattedPhoto;
        }else {
            //photo is a jpeg
            formattedPhoto = photoBase64.slice(8, photoBase64.length-2)
            imageSrc = "data:image/jpeg;base64," + formattedPhoto;
        }

        return imageSrc;

    };



    // Search function after the SEARCH button is pressed
    $scope.search = function() {
      //clear results from previous searches
      $scope.searchResults = [];

      // Only uses keyword
      var keywords = $scope.searchKey,
          keyArray = [];
      if ($scope.searchKey && !$scope.searchTimeBegin && !$scope.searchTimeEnd){
        keyArray = $.map(keywords.split(","), $.trim);
        console.log(keyArray);
        searchHandler.getKeyResults(usernameFromStorage, keyArray, function(result){
            console.log(result.data);
            displayResults(result.data.images, result.data.rows);
        });

      // Only uses time
      } else if (!$scope.searchKey && $scope.searchTimeBegin && $scope.searchTimeEnd) {
        var timeBegin = $scope.searchTimeBegin;
            timeEnd = $scope.searchTimeEnd;
        timeBegin = formatDate(timeBegin, 0);
        timeEnd = formatDate(timeEnd, 1);
        searchHandler.getTimeResults(usernameFromStorage, timeBegin, timeEnd, function(result){
            console.log(result.data);
            displayResults(result.data.images, result.data.rows);
        });

      // Uses all fields
      } else if ($scope.searchKey && $scope.searchTimeBegin && $scope.searchTimeEnd) {
        keyArray = $.map(keywords.split(","), $.trim);
        var timeBegin = $scope.searchTimeBegin;
            timeEnd = $scope.searchTimeEnd;
        timeBegin = formatDate(timeBegin, 0);
        timeEnd = formatDate(timeEnd, 1);
        searchHandler.getKeyTimeResults(usernameFromStorage, keyArray, timeBegin, timeEnd, function(result){
            console.log(result.data);
            displayResults(result.data.images, result.data.rows);
        });

      // All other inputs
      } else {
        console.log("Please enter a valid input");
      };
    };

});
