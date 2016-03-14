var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.upload.uploadHandler", [])
.service("uploadHandler", function($http, $q) {

    // Finds the most recent photo_id from the database
    //   var searchPerson = function(personName) {
    //   var d = $q.defer();
    //   var self = this;
    //   return $http({
    //     method: 'GET',
    //     params: {name: personName},
    //     url: 'http://localhost:3000/search',
    //   }).success(function(resp) {
    //     d.resolve(resp);
    //   }).error(function(err){
    //     d.reject(err);
    //   });
    //   return d.promise;
    // }
    this.getId = function() {
      var d = $q.defer();
      return $http({
        method: 'GET',
        url: SERVICE_BASE_URL + "upload",
      }).success(function(resp) {
        console.log(resp);
        d.resolve(resp);
      }).error(function(err){
        d.reject(err);
      });
    };


    // Uploads images to the database
    this.uploadImages = function (owner, permitted, subject, place, when, desc, thumbnail, photo, callback) {
        var $uploadpost = $http({
              method: 'POST',
              url: SERVICE_BASE_URL + "upload",
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              transformRequest: function(obj) {
                  var str = [];
                  for(var p in obj)
                  str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                  return str.join("&");
              },
              data: {owner_name: owner, permitted: permitted, subject: subject,
                      place: place, when: when, description: desc,
                      thumbnail: thumbnail, photo: photo,}
          }).success(function (result) {
              return callback(result);
          }).error(function (result) {
              return callback(result);
          });
    };

});
