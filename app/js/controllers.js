'use strict';

/* Controllers */
var app = angular.module('myApp.controllers', []);

app.controller('EvoCtrl', ['$scope', '$rootScope', '$http', 'Specimens',
    function($scope, $rootScope, $http, Specimens) {
        
        $scope.specimens = Specimens.queryAll();
        $rootScope.specimens = $scope.specimens;
        
        // The lineage is the sequence of parent specimens including specimens[0].
        if (typeof($rootScope.lineage) == "undefined") {
            $rootScope.lineage = [];
        }
        
        if (typeof($rootScope.treeParams) == "undefined") {
            $rootScope.treeParams = $scope.specimens[0].data.treeParams;
        };
        
        $scope.selectedSpecimen = 0;
        
        $scope.selectSpecimen = function (index) {
           $scope.selectedSpecimen = index;
        }

        $scope.drawTree = function() {
            var tp = $rootScope.treeParams;
            var ud = {
              udTrunkLengthIncrementPerYear: tp.tpTrunkLengthIncrementPerYear
            , udTrunkBranchLengthRatio: tp.tpTrunkBranchLengthRatio
            }
            $http({
                        method : 'POST',
                        url : '/conifer/draw',
                        data : ud
                    });
        };
        
  }]);
  
app.controller('SpecimenCtrl', ['$scope', '$rootScope', '$routeParams',
                                'Specimens',
    function($scope, $rootScope, $routeParams, Specimens) {
        // Take the parent if we fail to find the id.
        // Assumes there is at least one specimen.
        var match = Specimens.queryID($routeParams.id);
        if (typeof(match) == "undefined") {
            match = $rootScope.specimens[0];
        }
        $scope.specimen = match;
    }]);
  
app.controller('AdminCtrl', ['$scope', '$rootScope', '$routeParams',
    function($scope, $rootScope, $routeParams) {
    }]);
  