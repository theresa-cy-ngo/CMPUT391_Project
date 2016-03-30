var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.display.displayHandler", [])
.service("displayHandler", function($http, $q) {
  this.getPictures = function (username, callback) {
      $http({
          url: SERVICE_BASE_URL + "getMyPictures",
          method: "POST",
          params: {userName: username}
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.getGroupPictures = function (username, callback) {
      $http({
          url: SERVICE_BASE_URL + "getGroupPictures",
          method: "POST",
          params: {userName: username}
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.getAdminPictures = function (callback) {
      $http({
          url: SERVICE_BASE_URL + "getAdminPictures",
          method: "POST"
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.getPopularPictures = function (username, callback) {
      $http({
          url: SERVICE_BASE_URL + "getPopularPictures",
          method: "POST",
          data: {userName: username}
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.editImage = function (requestBody, callback) {
      console.log(requestBody);
      $http({
          url: SERVICE_BASE_URL + "updatePhoto",
          method: "POST",
          data: requestBody
          // {photoid: requestBody.photo_id, permit: requestBody.permitted, subject: requestBody.subject, place: requestBody.loc, timing: requestBody.date, desc: requestBody.desc}
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.checkTracking = function (username, photo_id, callback) {
      $http({
          url: SERVICE_BASE_URL + "checkTracking",
          method: "POST",
          params: {userName: username, photo_id: photo_id}
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.updateTracking = function (username, photo_id, callback) {
      $http({
          url: SERVICE_BASE_URL + "updateTracking",
          method: "POST",
          params: {userName: username, photo_id: photo_id}
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.deleteImage = function (photo_id, callback){
        $http({
            url: SERVICE_BASE_URL + "deleteImage",
            method: "POST",
            data: {photo_id: photo_id}
        })
        .then(function(result) {
            return callback(result);
        },
        function(result) {
        return callback(result);
    });


  };

});
