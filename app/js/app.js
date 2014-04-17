'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/specimens'});
  $routeProvider.when('/specimens', {
      templateUrl: 'templates/evo.html', 
      controller: 'EvoCtrl'});
  $routeProvider.when('/view/:id', {
      templateUrl: 'templates/specimen.html', 
      controller: 'ViewCtrl'});
  $routeProvider.when('/experiment/:id', {
      templateUrl: 'templates/specimen.html', 
      controller: 'ExperimentCtrl'});
}]);
