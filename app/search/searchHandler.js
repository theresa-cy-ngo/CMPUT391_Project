var SERVICE_BASE_URL = 'http://localhost:8080/';

angular.module("myApp.search.searchHandler", [])
.service("searchHandler", function($http, $q) {
  this.getKeyResults = function (query, callback) {

      $http({
          url: SERVICE_BASE_URL + "getKeyResults",
          method: "POST",
          data: {queryStr: query}
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.getTimeResults = function (username, timeStart, timeEnd, callback) {
      $http({
          url: SERVICE_BASE_URL + "getTimeResults",
          method: "POST",
          params: {userName: username, timeStart: timeStart, timeEnd: timeEnd}
      })
      .then(function(result) {
          return callback(result);
      },
      function(result) {
          return callback(result);
      });
  };

  this.getKeyTimeResults = function (query, callback) {
      $http({
          url: SERVICE_BASE_URL + "getKeyTimeResults",
          method: "POST",
          data: {queryStr: query}
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

});
