'use strict';

/* Controllers */
var app = angular.module('myApp.controllers', ['ngResource']);

app.controller('EvoCtrl', ['$scope', '$rootScope', '$http',
                            'Specimens', 'Lineage',
               
    function($scope, $rootScope, $http, Specimens, Lineage) {
        
        if (typeof($rootScope.specimenIDs) == "undefined") {
            $scope.specimenIDs = [0];
            $rootScope.specimenIDs = [0];
        } else {
            $scope.specimenIDs = $rootScope.specimenIDs;
        }
        
        $scope.specimens = Specimens.queryIDs($scope.specimenIDs);
        $rootScope.specimens = $scope.specimens;
        
        if (typeof($rootScope.lineage) == "undefined") {
            $scope.lineage = [];
            $rootScope.lineage = [];
        } else {
            $scope.lineage = $rootScope.lineage;
        }

        // Just for highlighting parent -- could do it in CSS.
        $scope.selectedSpecimen = $scope.specimenIDs[0];
        
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
        //    , data: specimenID
        //    , specimen: { id: specimenID, data: specimen data }
        // }
        $scope.updateLineage = function(parentSpecID) {
            var linID, linObj, parentSpec;

            linID = Lineage.insertInto(parentSpecID);
            linObj = Lineage.queryID(linID);
            
            parentSpec = Specimens.queryID(parentSpecID);
            linObj.specimen = parentSpec;
            
            // The one and only place to initialize and
            // update $scope.lineage and $rootScope.lineage.
            $scope.lineage.push(linObj)
            $rootScope.lineage = $scope.lineage;
        }

        var newSpecimen = function(parentSpecID) {
            var newSpecID = Specimens.reproduce(parentSpecID);
            var newSpec   = Specimens.queryID(newSpecID);
            var setImg = function(spec, data) {
                spec.data.imageUrl = "img/" + data;
            };
            
            $scope.specimenIDs.push(newSpecID);
            $rootScope.specimenIDs = $scope.specimenIDs;
            
            // post request for drawing, receiving url to image
            // save url in specimen
            //newSpec.data.imageUrl = "img/specimen01.svg";
            $scope.drawTree(newSpec.data.treeParams,
                function(data, status, headers, config){
                    setImg(newSpec, data);
                });
        };
        
        $scope.nextGeneration = function(parentSpecID) {
            var numKids, i, imgUrl;
            
            $scope.updateLineage(parentSpecID);

            // Reset specimenIDs starting with new parent.
            $scope.specimenIDs = [parentSpecID];
            $rootScope.specimenIDs = $scope.specimenIDs;

            numKids = 3;
            for (i = 0; i < numKids; ++i) {
                newSpecimen(parentSpecID);
            }

            $scope.specimens = Specimens.queryIDs($scope.specimenIDs);
            $rootScope.specimens = $scope.specimens;
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
                            'Specimens', 'Lineage',
    function($scope, $routeParams, Specimens, Lineage) {
        // Take the parent if we fail to find the id.
        // Assumes there is at least one specimen.
        var match = Specimens.queryID($routeParams.id);
        if (typeof(match) == "undefined") {
            match = Lineage.queryLast; // could return null
        }
        
        $scope.specimenData = match.data;
        $scope.view = true;
    }]);
  
app.controller('ExperimentCtrl', ['$scope', '$routeParams',
                                  'Specimens', 'Lineage',
    function($scope, $routeParams, Specimens, Lineage) {
        // Take the parent if we fail to find the id.
        // Assumes there is at least one specimen.
        var match = Specimens.queryID($routeParams.id);
        if (typeof(match) == "undefined") {
            match = Lineage.queryLast; // could return null
        }

        // Always work on a copy of the specimen.
        $scope.specimenData = Specimens.copySpecimen(match.data);

        // Patch the imageUrl back in.
        $scope.specimenData.imageUrl = match.data.imageUrl;

        $scope.view = false;
    }]);

app.controller('AdminCtrl', ['$scope', '$rootScope', '$routeParams',
                             '$location', '$http', 'Specimens',
    function($scope, $rootScope, $routeParams, $location, $http, Specimens) {
        var newSpecimen, drawTree, fetchDrawing;
        
        newSpecimen = function(specData) {
            var newSpecID = Specimens.insertInto(specData);
            var newSpec   = Specimens.queryID(newSpecID);
            var setImg = function(spec, data) {
                spec.data.imageUrl = "img/" + data;
            };
            
            // post request for drawing, receiving url to image
            // save url in specimen
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
            // save url in specimen
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
            fetchDrawing($scope.specimenData);
        };
        
        // Only available from ExperimentCtrl.
        $scope.propagate = function() {
            // Reset lineage and insert specimenData as first item.
            Specimens.init();
            var id = newSpecimen($scope.specimenData);
            $rootScope.specimenIDs = [id];
            $rootScope.lineage = [];
            $location.path("/specimens");
        };
        
        // Only available from ViewCtrl.
        $scope.experiment = function() {
            $location.path("/experiment/" + $routeParams.id);
        };
    }]);
  