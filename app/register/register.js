angular.module("myApp.register", ["ngRoute", "myApp.register.registerHandler"])

.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/register", {
        templateUrl: "register/register.html",
        controller: "RegisterController"
    });
}])

.controller("RegisterController", function($scope, $location, registerHandler) {
    $scope.registerUsr = function() {

      if($scope.regUser || $scope.regMail) {
        registerHandler.check($scope.regUser, $scope.regMail, function (result) {

          if(result.success){
            registerHandler.register($scope.regUser, $scope.regPass, $scope.regName, $scope.regLast, $scope.regAddr, $scope.regMail, $scope.regPhone,
                function(result) {
                  if(result.success){
                    $location.url("/login");
                  }else{
                    alert("Error2");
                  }
              });
          }else{
            alert("Error1");
          }
        });

      } else {
        alert("Username and Email fields cannot be empty");
      }
    }

      // registerHandler.check($scope.regUser, $scope.regMail, function (result) {
      //   if(result.success){
      //     registerHandler.register($scope.regUser, $scope.regPass, $scope.regName $scope.regLast, $scope.regAddr, $scope.regMail, $scope.regPhone,
      //         function(result) {
      //           if(result.success){
      //             $location.url("/login");
      //           }else{
      //             alert("Error2");
      //           }
      //       	});
      //     };
      //   };
      //   }else{
      //     alert("Error1");
      //   }
      // });
})
