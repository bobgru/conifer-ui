'use strict';

/* Controllers */
var app = angular.module('myApp.controllers', ['ngResource']);

/*
    $rootScope
        lineage
        selectedAncestor
*/

app.controller('PopulationCtrl', ['$scope', '$rootScope', 'Population', 'CurrentPopulation',
    function($scope, $rootScope, Population, CurrentPopulation) {
        
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
        }
        
        $scope.population = Population.queryIDs(populationIDs);
        
        if (typeof($rootScope.lineage) == "undefined") {
            $scope.lineage = [];
            $rootScope.lineage = [];
        } else {
            $scope.lineage = $rootScope.lineage;
        }

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


app.controller('PropagationCtrl', ['$rootScope', '$http',
                                   '$routeParams', '$location',
                                   'Population', 'CurrentPopulation', 'Lineage',
               
    function($rootScope, $http, $routeParams, $location, 
            Population, CurrentPopulation, Lineage) {
        var parentID, numKids, i, imgUrl,
            populationIDs, population, newLinObj;
        
        /*
            $scope
        */
            
        // Side-effects:
        //   updates Lineage, $scope.lineage, $rootScope.lineage
        //
        // Objects in lineage array have form:
        // lineage[0] = {
        //      id: lineage ID
        //    , data: individualID
        //    , individual: { id: individualID, data: individual data }
        // }
        var updateLineage = function(parentID) {
            var linID, linObj, parent;

            linID = Lineage.insertInto(parentID);
            linObj = Lineage.queryID(linID);
            
            parent = Population.queryID(parentID);
            linObj.individual = parent;
            
            return linObj;
        }

        var newIndividual = function(parentID) {
            var childID = Population.reproduce(parentID);
            var child   = Population.queryID(childID);
            var setImg = function(spec, data) {
                spec.data.imageUrl = "img/" + data;
            };
            
            CurrentPopulation.push(childID);
            
            // post request for drawing, receiving url to image
            // save url in individual
            //newSpec.data.imageUrl = "img/individual01.svg";
            drawTree(child.data.treeParams,
                function(data, status, headers, config){
                    setImg(child, data);
                });
        };
        
        var drawTree = function(tp, ok) {
            $http({ method : 'POST',
                    url : 'conifer/draw',
                    data : 'userdata=' + angular.toJson(tp),
                    headers: {'Content-Type':
                        'application/x-www-form-urlencoded'}
                }).success(ok);
        };
        
        parentID = $routeParams.id;
        newLinObj = updateLineage(parentID);

        // Reset populationIDs starting with new parent.
        CurrentPopulation.init();
        CurrentPopulation.push(parentID);

        // Propagate parent to give next generation population.
        numKids = 3;
        for (i = 0; i < numKids; ++i) {
            newIndividual(parentID);
        }

        // Update $rootScope variables to communicate with PopulationCtrl.
        if (typeof($rootScope.lineage) == "undefined") {
            $rootScope.lineage = [newLinObj];
        } else {
            $rootScope.lineage.push(newLinObj)
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
  
app.controller('ExperimentCtrl', ['$scope', '$rootScope', '$routeParams',
                                  '$location', '$http', 'Population', 'Lineage',
    function($scope, $rootScope, $routeParams, $location, $http, Population, Lineage) {
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

        fetchDrawing = function(specData) {
            var setImg = function(specData, data) {
                specData.imageUrl = "img/" + data;
            };
            
            // post request for drawing, receiving url to image
            // save url in individual
            drawTree(specData.treeParams,
                function(data, status, headers, config){
                    setImg(specData, data);
                });
        };
        
        drawTree = function(tp, ok) {
            $http({
                        method : 'POST',
                        url : 'conifer/draw',
                        data : 'userdata=' + angular.toJson(tp),
                        headers: {'Content-Type':
                            'application/x-www-form-urlencoded'}
                    }).success(ok);
        };
        
        $scope.test = function() {
            fetchDrawing($scope.individualData);
        };
        
        newIndividual = function(specData) {
            var newSpecID = Population.insertInto(specData);
            var newSpec   = Population.queryID(newSpecID);
            var setImg = function(spec, data) {
                spec.data.imageUrl = "img/" + data;
            };
            
            // post request for drawing, receiving url to image
            // save url in individual
            drawTree(newSpec.data.treeParams,
                function(data, status, headers, config){
                    setImg(newSpec, data);
                });
            
            return newSpecID;
        };
        
        $scope.propagate = function() {
            Lineage.init();
            Population.init();
            CurrentPopulation.init();
            
            var id = newIndividual($scope.individualData);
            CurrentPopulation.push(id);

            $rootScope.lineage = [];

            $location.path("/population");
        };
        
        $scope.destroy = function() {
            $location.path("/view/" + $routeParams.id);
        };
        
    }]);

app.controller('AdminCtrl', [
    function() {
        
    }]);
  