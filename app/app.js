// Declare app level module which depends on views, and components
angular.module("myApp", [
    "ngRoute",
    "LocalStorageModule",
    "myApp.login",
    "myApp.register",
    "myApp.display",
    "myApp.groups",
    "myApp.displayGroups",
    "myApp.analysis",
    "myApp.search",
    "myApp.home"
]).
config(["$routeProvider", function($routeProvider) {
    $routeProvider.otherwise({redirectTo: "/login"});
}]).
config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('c391')
    .setStorageType('sessionStorage');
});
