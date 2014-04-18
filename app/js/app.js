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
  $routeProvider.otherwise({redirectTo: '/population'});
  $routeProvider.when('/population', {
      templateUrl: 'templates/population.html', 
      controller: 'PopulationCtrl'});
  $routeProvider.when('/view/:id', {
      templateUrl: 'templates/individual.html', 
      controller: 'ViewCtrl'});
  $routeProvider.when('/experiment/:id', {
      templateUrl: 'templates/individual.html', 
      controller: 'ExperimentCtrl'});
}]);
