angular.module("myApp.search", ["ngRoute", "LocalStorageModule", "myApp.search.searchHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/search", {
        templateUrl: "search/search.html",
        controller: "searchController"
    });
}])

.controller("searchController", function($scope, $location, localStorageService, searchHandler) {
    var usernameFromStorage,
        storageKey = "user",
        currentImage;

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

    $scope.showImageDetails = function (selectedImage){
      $scope.selected = selectedImage;
      currentImage = selectedImage;
      searchHandler.checkTracking(usernameFromStorage, currentImage.id, function(result){
          if (!result.data.results[0]) {
              searchHandler.updateTracking(usernameFromStorage, currentImage.id, function(result){
                  console.log("Update complete");
              });
          } else {
              console.log("Data is already in the system");
          };
      });
    };

    displayResults = function (photoResults, rowResults) {
      var image = new Image(),
          photoString,
          photo;


        for(var i = 0; i < photoResults.length; i++){
            photoString = photoResults[i];

            image.src = getImageSrc(photoString);
            $scope.searchResults.push({src: image.src,
                                    id: rowResults[i][8],
                                    owner: rowResults[i][7],
                                    permit: rowResults[i][6],
                                    subject: rowResults[i][5],
                                    place: rowResults[i][4],
                                    timing: rowResults[i][3],
                                    desc: rowResults[i][2]
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

    queryBuilder = function (keywords, queryType, time) {
      //["user1", "user2"]

          var formattedQuery = "",
              nonAdmin_str =  "(images.permitted IN " +
                              "(SELECT group_id FROM group_lists WHERE group_lists.friend_id = '" + usernameFromStorage + "') " +
                              "OR images.permitted = 1 " +
                              "OR (images.permitted = 2 AND images.owner_name = '" + usernameFromStorage + "')) AND ",
              dateAdded_str = "";


          var score = [];
          for (var index = 0; index < (keywords.length * 3); index+=3){
              score.push(index+1);
              score.push(index+2);
              score.push(index+3);
          }

          var score_select = "";
          for (var index = 0; index < score.length; index++) {
              score_select += "score(" + score[index] + ") "
              if (index != score.length-1){
                  score_select += ", "
              }
          }

          var where_str = "";
          for(var index = 0; index < keywords.length; index++){
              where_str += "contains(subject, '"+ keywords[index] + "', " + score[(index*3)] + ") > 0 OR contains(place, '" + keywords[index] + "', " + score[(index*3)+1] + ") > 0 OR contains(description, '" + keywords[index] + "', " + score[(index*3)+2] + ") > 0 "
              if (index != keywords.length-1){
                  where_str += "OR "
              }
          }

          var order_str = "";
          for (var index = 0; index < score.length; index+=3){
              order_str += "score(" + score[index] + ") * 6 + "
              order_str += "score(" + score[index+1] + ") * 3 + "
              order_str += "score(" + score[index+2] + ") * 1 "
              if (index != score.length-3) {
                  order_str += "+ "
              }
          }


          if(queryType == "keyOnly"){

              if(usernameFromStorage !== "admin"){
                formattedQuery =
                   "SELECT photo, thumbnail, description, timing, place, subject, permitted, owner_name, photo_id, " +
                   score_select + " FROM IMAGES WHERE " + nonAdmin_str + "(" + where_str + ") " + " ORDER BY " + order_str + " DESC";
              }else {
                formattedQuery =
                   "SELECT photo, thumbnail, description, timing, place, subject, permitted, owner_name, photo_id, " +
                   score_select + " FROM IMAGES WHERE " + "(" + where_str + ") " + " ORDER BY " + order_str + " DESC";
              }

          }else if(queryType == "allFields"){
              dateAdded_str =
                "(timing BETWEEN TO_DATE ('"+ time.begin + "', 'yyyy/mm/dd') AND TO_DATE ('" + time.end + "', 'yyyy/mm/dd')) AND ";

              if(usernameFromStorage !== "admin"){
                  formattedQuery =
                     "SELECT photo, thumbnail, description, timing, place, subject, permitted, owner_name, photo_id, " +
                     score_select + " FROM IMAGES WHERE " + dateAdded_str + nonAdmin_str + "(" + where_str + ") " + " ORDER BY " + order_str + " DESC";
              }else {
                  formattedQuery =
                   "SELECT photo, thumbnail, description, timing, place, subject, permitted, owner_name, photo_id, " +
                   score_select + " FROM IMAGES WHERE " + dateAdded_str + "(" + where_str + ") " + " ORDER BY " + order_str + " DESC";
              }

          }



          console.log(formattedQuery);
          return formattedQuery;

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
        // console.log(keyArray);


        var query = queryBuilder(keyArray, "keyOnly", null);

        searchHandler.getKeyResults(query, function(result){
            console.log(result.data);
            if(result.data.images.length == 0){
              alert("No search results");
            }else {
              displayResults(result.data.images, result.data.rows);
            }
        });

      // Only uses time
      } else if (!$scope.searchKey && $scope.searchTimeBegin && $scope.searchTimeEnd) {
        var timeBegin = $scope.searchTimeBegin;
            timeEnd = $scope.searchTimeEnd;
        timeBegin = formatDate(timeBegin, 0);
        timeEnd = formatDate(timeEnd, 1);

        searchHandler.getTimeResults(usernameFromStorage, timeBegin, timeEnd, function(result){
            // console.log(result.data);
            if(result.data.images.length == 0){
              alert("No search results");
            }else {
              displayResults(result.data.images, result.data.rows);
            }
        });

      // Uses all fields
      } else if ($scope.searchKey && $scope.searchTimeBegin && $scope.searchTimeEnd) {
        keyArray = $.map(keywords.split(","), $.trim);
        var timeBegin = $scope.searchTimeBegin;
            timeEnd = $scope.searchTimeEnd;
        timeBegin = formatDate(timeBegin, 0);
        timeEnd = formatDate(timeEnd, 1);

        var query =  queryBuilder(keyArray, "allFields", {begin: timeBegin, end: timeEnd});

        searchHandler.getKeyTimeResults(query, function(result){
            console.log(result.data);
            if(result.data.images.length == 0){
              alert("No search results");
            }else {
              displayResults(result.data.images, result.data.rows);
            }
        });

      // All other inputs
      } else {
        alert("Please enter a valid input");
      };
    };

});
