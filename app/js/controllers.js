'use strict';

/* Controllers */
var app = angular.module('myApp.controllers', ['ngResource']);

app.controller('PopulationCtrl', ['$scope', '$rootScope', '$http',
                                  'Population', 'Lineage',
               
    function($scope, $rootScope, $http, Population, Lineage) {
        
        if (typeof($rootScope.populationIDs) == "undefined") {
            $scope.populationIDs = [0];
            $rootScope.populationIDs = [0];
        } else {
            $scope.populationIDs = $rootScope.populationIDs;
        }
        
        $scope.population = Population.queryIDs($scope.populationIDs);
        $rootScope.population = $scope.population;
        
        if (typeof($rootScope.lineage) == "undefined") {
            $scope.lineage = [];
            $rootScope.lineage = [];
        } else {
            $scope.lineage = $rootScope.lineage;
        }

        // Just for highlighting parent -- could do it in CSS.
        $scope.selectedIndividual = $scope.populationIDs[0];
        
        // OK if undefined -- nothing to select
        $scope.selectedAncestor = $rootScope.selectedAncestor;

        //$scope.svgTest = "To be replaced by result of POST";

        $scope.selectAncestor = function (linId) {
           $scope.selectedAncestor = linId;
           $rootScope.selectedAncestor = linId;
        };

        // Side-effects:
        //   updates Lineage, $scope.lineage, $rootScope.lineage
        //
        // Objects in lineage array have form:
        // lineage[0] = {
        //      id: lineage ID
        //    , data: individualID
        //    , individual: { id: individualID, data: individual data }
        // }
        $scope.updateLineage = function(parentSpecID) {
            var linID, linObj, parentSpec;

            linID = Lineage.insertInto(parentSpecID);
            linObj = Lineage.queryID(linID);
            
            parentSpec = Population.queryID(parentSpecID);
            linObj.individual = parentSpec;
            
            // The one and only place to initialize and
            // update $scope.lineage and $rootScope.lineage.
            $scope.lineage.push(linObj)
            $rootScope.lineage = $scope.lineage;
        }

        var newIndividual = function(parentSpecID) {
            var newSpecID = Population.reproduce(parentSpecID);
            var newSpec   = Population.queryID(newSpecID);
            var setImg = function(spec, data) {
                spec.data.imageUrl = "img/" + data;
            };
            
            $scope.populationIDs.push(newSpecID);
            $rootScope.populationIDs = $scope.populationIDs;
            
            // post request for drawing, receiving url to image
            // save url in individual
            //newSpec.data.imageUrl = "img/individual01.svg";
            $scope.drawTree(newSpec.data.treeParams,
                function(data, status, headers, config){
                    setImg(newSpec, data);
                });
        };
        
        $scope.nextGeneration = function(parentSpecID) {
            var numKids, i, imgUrl;
            
            $scope.updateLineage(parentSpecID);

            // Reset populationIDs starting with new parent.
            $scope.populationIDs = [parentSpecID];
            $rootScope.populationIDs = $scope.populationIDs;

            numKids = 3;
            for (i = 0; i < numKids; ++i) {
                newIndividual(parentSpecID);
            }

            $scope.population = Population.queryIDs($scope.populationIDs);
            $rootScope.population = $scope.population;
        };

        $scope.drawTree = function(tp, ok) {
            $http({
                        method : 'POST',
                        url : 'conifer/draw',
                        data : 'userdata=' + angular.toJson(tp),
                        headers: {'Content-Type':
                            'application/x-www-form-urlencoded'}
                    }).success(ok);
        };
        
  }]);
  
app.controller('ViewCtrl', ['$scope', '$routeParams',
                            'Population', 'Lineage',
    function($scope, $routeParams, Population, Lineage) {
        // Take the parent if we fail to find the id.
        // Assumes there is at least one individual.
        var match = Population.queryID($routeParams.id);
        if (typeof(match) == "undefined") {
            match = Lineage.queryLast; // could return null
        }
        
        $scope.individualData = match.data;
        $scope.view = true;
    }]);
  
app.controller('ExperimentCtrl', ['$scope', '$routeParams',
                                  'Population', 'Lineage',
    function($scope, $routeParams, Population, Lineage) {
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
    }]);

app.controller('AdminCtrl', ['$scope', '$rootScope', '$routeParams',
                             '$location', '$http', 'Population',
    function($scope, $rootScope, $routeParams, $location, $http, Population) {
        var newIndividual, drawTree, fetchDrawing;
        
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
        
        // Only available from ExperimentCtrl.
        $scope.destroy = function() {
            $location.path("/view/" + $routeParams.id);
        };
        
        // Only available from ExperimentCtrl.
        $scope.test = function() {
            fetchDrawing($scope.individualData);
        };
        
        // Only available from ExperimentCtrl.
        $scope.propagate = function() {
            // Reset lineage and insert individualData as first item.
            Population.init();
            var id = newIndividual($scope.individualData);
            $rootScope.populationIDs = [id];
            $rootScope.lineage = [];
            $location.path("/population");
        };
        
        // Only available from ViewCtrl.
        $scope.experiment = function() {
            $location.path("/experiment/" + $routeParams.id);
        };
    }]);
  