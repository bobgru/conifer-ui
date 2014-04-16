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
  
app.controller('SpecimenCtrl', ['$scope', '$routeParams',
                                'Specimens', 'Lineage',
    function($scope, $routeParams, Specimens, Lineage) {
        // Take the parent if we fail to find the id.
        // Assumes there is at least one specimen.
        var match = Specimens.queryID($routeParams.id);
        if (typeof(match) == "undefined") {
            match = Lineage.queryLast; // could return null
        }
        $scope.specimen = match;
    }]);
  
app.controller('AdminCtrl', ['$scope', '$rootScope', '$routeParams',
    function($scope, $rootScope, $routeParams) {
    }]);
  