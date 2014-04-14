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
  $routeProvider.otherwise({redirectTo: '/evo'});
  $routeProvider.when('/evo', {
      templateUrl: 'templates/evo.html', 
      controller: 'EvoCtrl'});
  $routeProvider.when('/evo/:id', {
      templateUrl: 'templates/specimen.html', 
      controller: 'SpecimenCtrl'});
}]);
