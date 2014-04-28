'use strict';

/* Controllers */
var app = angular.module('myApp.controllers', ['ngResource']);

/*
    $rootScope
        selectedAncestor
*/

app.controller('PopulationCtrl', ['$scope', '$rootScope', 
                                  'Population', 'CurrentPopulation', 'Lineage',
                                  'Image', 'ConiferLib',
                                  
    function($scope, $rootScope, Population, CurrentPopulation, Lineage, Image, ConiferLib) {
        
        /*
            $scope
                population
                stats
                lineage
                selectedAncestor
        */
        var initScope, calcStats;

        initScope = function() {
            var populationIDs, i, parentID, childID, parent, child, diff, stats;
            
            populationIDs = CurrentPopulation.query();
            if (populationIDs.length == 0) {
                CurrentPopulation.push(0);
                populationIDs = CurrentPopulation.query();
            }
            $scope.population = Population.queryIDs(populationIDs);
            $scope.lineage = Lineage.query();

            calcStats(populationIDs);

            // OK if undefined -- nothing to select
            $scope.selectedAncestor = $rootScope.selectedAncestor;
        }

        calcStats = function (populationIDs) {
            var i, parentID, childID, parent, child, diff, stats;

            parentID = populationIDs[0];
            parent = Population.queryID(parentID);
            $scope.stats = {};
            $scope.stats[parentID] = [];
            for (i = 1; i < populationIDs.length; ++i) {
                childID = populationIDs[i];
                child = Population.queryID(childID);
                diff = ConiferLib.objRelativeDiff(parent.data.treeParams,child.data.treeParams);
                stats = ConiferLib.sortObjRelativeDiffDesc(diff);
                
                $scope.stats[childID] = stats.relDiff.slice(0,2);
            }
        };

        $scope.selectAncestor = function (linId) {
           $scope.selectedAncestor = linId;
           $rootScope.selectedAncestor = linId;
        };
        
        $scope.propagate = function(parentID) {
            var childID, child, numKids, i;

            Lineage.insertInto(parentID);
            CurrentPopulation.init();
            CurrentPopulation.push(parentID);

            numKids = 7;
            for (i = 0; i < numKids; ++i) {
                childID = Population.reproduce(parentID);
                child = Population.queryID(childID);
                CurrentPopulation.push(childID);

                Image.getByID(childID);
                child.data.dirty = false;
            }
            
            initScope();
        };
        
        initScope();
  }]);

app.controller('ViewCtrl', ['$scope', '$routeParams', '$location', 
                            'Population', 'Lineage',
    function($scope, $routeParams, $location, Population, Lineage) {
        // Take the parent if we fail to find the id.
        // Assumes there is at least one individual.
        var match = Population.queryID($routeParams.id);
        if (match === undefined) {
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

        var newIndividual, drawTree, fetchDrawing,
            match, setDirtyBit;

        setDirtyBit = function(newVal, oldVal) {
            // console.log('sDB: $scope.individualData.treeParams.age = ' +
            //              $scope.individualData.treeParams.age);
            if (newVal != oldVal) {
                $scope.individualData.dirty = true;
            }};

        // Take the parent if we fail to find the id.
        // Assumes there is at least one individual.
        match = Population.queryID($routeParams.id);
        if (typeof(match) == "undefined") {
            match = Lineage.queryLast; // could return null
        }

        // Always work on a copy of the individual.
        $scope.individualData = Population.copyIndividual(match.data);

        // Patch the imageUrl back in.
        $scope.individualData.imageUrl = match.data.imageUrl;
        $scope.individualData.dirty = false;

        $scope.view = false;

        // Must call $digest to enable the $watch to see changes from initial values.
        $scope.$watch('individualData.treeParams', setDirtyBit, true);
        //$scope.$digest();

        $scope.test = function() {
            Image.get($scope.individualData);
            $scope.individualData.dirty = false;
        };
        
        $scope.propagate = function() {
            var id;
            
            // Destroy the world.
            Lineage.init();
            Population.init();
            CurrentPopulation.init();

            // Start over with the new sire.
            id = Population.insertInto($scope.individualData);
            CurrentPopulation.push(id);
            if ($scope.individualData.dirty) {
                Image.getByID(id);
                $scope.individualData.dirty = false;
            }

            $location.path("/population");
        };
        
        $scope.destroy = function() {
            $location.path("/view/" + $routeParams.id);
        };
    }]);
