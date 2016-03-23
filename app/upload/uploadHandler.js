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
    this.getId = function(owner, permitted, subject, place, when, desc, photo) {
      var self = this;
      var d = $q.defer();
      return $http({
        method: 'GET',
        url: SERVICE_BASE_URL + "upload",
      }).success(function(resp) {
        console.log(resp.rows);
        var latest_id = resp.rows[0];
        if (latest_id == null) {
          console.log("Empty database")
          latest_id = 0;
        } else {
          latest_id = latest_id[0];
        };
        for (var i = 0; i < photo.length; i++) {
          console.log(latest_id+1);
          console.log(photo[i]);
          uploadImages(latest_id+1, owner, permitted, subject, place, when, desc, photo[i]);
        }
        //this.uploadImages(latest_id, owner, permitted, subject, place, when, desc, thumbnail, photo);
        d.resolve(resp);
      }).error(function(err){
        d.reject(err);
      });
    };


    // Uploads images to the database
    var uploadImages = function (new_id, owner, permitted, subject, place, when, desc, photo, callback) {
      console.log(photo);
      $http({
         url: SERVICE_BASE_URL + "upload",
         method: "POST",
         data: {new_id: new_id, owner_name: owner, permitted: permitted, subject: subject,
                 place: place, when: when, desc: desc,
                 photo: photo}
      })
      .then(function(result) {
         console.log(result);
         return callback(result);
      },
      function(result) { // optional
         //console.log(result);
         return callback(result);
      });
    };

});
