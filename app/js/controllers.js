'use strict';

/* Controllers */
var app = angular.module('myApp.controllers', []);

app.controller('EvoCtrl', ['$scope', '$rootScope', 'Specimens', 'Lineage',
    function($scope, $rootScope, Specimens, Lineage) {
        
        $scope.specimens = Specimens.queryAll();
        $rootScope.specimens = $scope.specimens;
        
        if (typeof($scope.specimens[0]) != "undefined") {
            $scope.selectedSpecimen = $scope.specimens[0].id;
        }
        $scope.selectedAncestor = $rootScope.selectedAncestor;

        // Objects in lineage array have form:
        // lineage[0] = {
        //      id: lineage ID
        //    , data: specimenID
        //    , specimen: { id: specimenID, data: specimen data }
        // }
        $scope.resolveLineageData = function() {
            var result = [];
            var lineageIds = Lineage.queryAll();
            lineageIds.forEach(function(linId) {
                //var obj = Object.create(linId);
                var obj = {};
                obj.id = linId.id;
                obj.data = linId.data;
                var spec = Specimens.queryID(obj.data);
                if (spec != null) {
                    obj.specimen = spec;
                    result.push(obj);
                }
            });
            return result;
        };

        // The lineage is the sequence of parent specimens including specimens[0].
        $scope.lineage = $scope.resolveLineageData();
        $scope.lineageRaw = Lineage.queryAll();
        $rootScope.lineage = $scope.lineage;
                
        // $scope.selectSpecimen = function (index) {
        //    $scope.selectedSpecimen = index;
        // }

        $scope.selectAncestor = function (linId) {
           $scope.selectedAncestor = linId;
           $rootScope.selectedAncestor = linId;
        }
        
        $scope.nextGeneration = function(specId) {
            Lineage.insertInto(specId);
            $scope.lineage = $scope.resolveLineageData();
            $rootScope.lineage = $scope.lineage;
        };

        $scope.drawTree = function() {
            // var tp = $rootScope.treeParams;
            // var ud = {
            //   udTrunkLengthIncrementPerYear: tp.tpTrunkLengthIncrementPerYear
            // , udTrunkBranchLengthRatio: tp.tpTrunkBranchLengthRatio
            // }
            // $http({
            //             method : 'POST',
            //             url : '/conifer/draw',
            //             data : ud
            //         });
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
  