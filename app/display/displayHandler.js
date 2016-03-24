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

  this.getPopularPictures = function (username, callback) {
      $http({
          url: SERVICE_BASE_URL + "getPopularPictures",
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

});
