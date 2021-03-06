// Declare app level module which depends on views, and components
angular.module("myApp", [
    "ngRoute",
    "LocalStorageModule",
    "jkuri.gallery",
    "ngFileUpload",
    "myApp.login",
    "myApp.upload",
    "myApp.register",
    "myApp.display",
    "myApp.edit",
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
