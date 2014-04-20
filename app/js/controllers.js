'use strict';

/* Controllers */
var app = angular.module('myApp.controllers', ['ngResource']);

/*
    $rootScope
        selectedAncestor
*/

app.controller('PopulationCtrl', ['$scope', '$rootScope', 
                                  'Population', 'CurrentPopulation', 'Lineage',
                                  
    function($scope, $rootScope, Population, CurrentPopulation, Lineage) {
        
        /*
            $scope
                population
                lineage
                selectedAncestor
                selectedIndividual
        */
        var populationIDs;

        populationIDs = CurrentPopulation.query();
        if (populationIDs.length == 0) {
            CurrentPopulation.push(0);
            populationIDs = CurrentPopulation.query();
        }
        $scope.population = Population.queryIDs(populationIDs);
        $scope.lineage = Lineage.query();

        // Just for highlighting parent -- could do it in CSS.
        $scope.selectedIndividual = populationIDs[0];
        
        // OK if undefined -- nothing to select
        $scope.selectedAncestor = $rootScope.selectedAncestor;

        //$scope.svgTest = "To be replaced by result of POST";

        $scope.selectAncestor = function (linId) {
           $scope.selectedAncestor = linId;
           $rootScope.selectedAncestor = linId;
        };
  }]);


app.controller('PropagationCtrl', ['$routeParams', '$location',
                                   'Population', 'CurrentPopulation', 'Lineage',
                                   'Image',
    function($routeParams, $location, 
            Population, CurrentPopulation, Lineage, Image) {
                
        var parentID, childID, numKids, i, initChildImage;

        parentID = $routeParams.id;
        
        Lineage.insertInto(parentID);
        CurrentPopulation.init();
        CurrentPopulation.push(parentID);

        numKids = 3;
        for (i = 0; i < numKids; ++i) {
            childID = Population.reproduce(parentID);
            CurrentPopulation.push(childID);
            Image.getByID(childID);
        }

        $location.path('/population');
  }]);

app.controller('ViewCtrl', ['$scope', '$routeParams', '$location', 
                            'Population', 'Lineage',
    function($scope, $routeParams, $location, Population, Lineage) {
        // Take the parent if we fail to find the id.
        // Assumes there is at least one individual.
        var match = Population.queryID($routeParams.id);
        if (typeof(match) == "undefined") {
            match = Lineage.queryLast; // could return null
        }
        
        $scope.individualData = match.data;
        $scope.view = true;

        $scope.experiment = function() {
            $location.path("/experiment/" + $routeParams.id);
        };
    }]);
  
app.controller('ExperimentCtrl', ['$scope', '$routeParams',
                                  '$location', 'Population',
                                  'CurrentPopulation', 'Lineage', 'Image',
    function($scope, $routeParams, $location,
            Population, CurrentPopulation, Lineage, Image) {
        var newIndividual, drawTree, fetchDrawing;

        // Take the parent if we fail to find the id.
        // Assumes there is at least one individual.
        var match = Population.queryID($routeParams.id);
        if (typeof(match) == "undefined") {
            match = Lineage.queryLast; // could return null
        }

        // Always work on a copy of the individual.
        $scope.individualData = Population.copyIndividual(match.data);

        // Patch the imageUrl back in.
        $scope.individualData.imageUrl = match.data.imageUrl;

        $scope.view = false;

        $scope.test = function() {
            Image.get($scope.individualData);
        };
        
        $scope.propagate = function() {
            var id;
            
            Lineage.init();
            Population.init();
            CurrentPopulation.init();

            id = Population.insertInto($scope.individualData);
            CurrentPopulation.push(id);
            Image.getByID(id);

            $location.path("/population");
        };
        
        $scope.destroy = function() {
            $location.path("/view/" + $routeParams.id);
        };
    }]);

app.controller('AdminCtrl', [
    function() {
        
    }]);
  