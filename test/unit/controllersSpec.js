'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('myApp.controllers'));
  beforeEach(module('myApp.services'));

  describe('EvoCtrl', function() {
      var $scope, $rootScope, createController;
      var specimens, spec0, spec1, lineage, lineageRaw;
      
      beforeEach(inject(function($injector){
          $rootScope = $injector.get('$rootScope');
          $scope     = $rootScope.$new();
          
          var $controller = $injector.get('$controller');

          createController = function() {
              return $controller('EvoCtrl', {
                  '$scope': $scope
              });
          };
          
          specimens = [spec0, spec1];
          spec0 = {id:0, data:{treeParams:{}, imageUrl:"foo.svg"}};
          spec1 = {id:1, data:{treeParams:{}, imageUrl:"bar.svg"}};
          
          lineage = [];
      }));
      
      it('should have empty lineage', inject(function(Specimens,Lineage) {
          spyOn(Specimens, 'queryAll').andReturn(specimens);
          spyOn(Specimens, 'queryID').andReturn(spec0);
          spyOn(Lineage, 'queryAll').andReturn(lineage);
     
          var controller = createController();
          expect($scope.lineage).toEqual([]);
      }));
      
      
      // This test throws an exception at the call to nextGeneration, which
      // is undefined, because the controller object hasn't been created
      // corrrectly, as witnessed in the debugger.
      
      // it('should have one ancestor in lineage', inject(function(Specimens,Lineage) {
      //     var ancestor, lineageState;
      //     spyOn(Specimens, 'queryAll').andReturn(specimens);
      //     spyOn(Specimens, 'queryID').andReturn(spec1);
      //     
      //     lineageState = 0;
      //     ancestor = {id:0, data:1};
      //     lineageRaw = [ancestor];
      //     lineage = [{id:0, data:1, specimen:spec1}];
      //     spyOn(Lineage, 'queryAll').andCallFake(function() {
      //         switch (lineageState) {
      //             case 0: 
      //               return [];
      //             case 1:
      //               return lineage;
      //         }
      //     });
      //     spyOn(Lineage, 'insertInto').andCallFake(function() {
      //         lineageState = 1;
      //         return 0;
      //     });
      //      
      //     var controller = createController();
      //     expect($scope.lineage).toEqual([]);
      // 
      //     controller.nextGeneration(1);
      //     expect($scope.lineageRaw).toEqual(lineageRaw);
      //     
      // }));
      
  });
});
