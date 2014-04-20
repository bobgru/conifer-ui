'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('myApp.controllers'));
  beforeEach(module('myApp.services'));

  describe('PopulationCtrl', function() {
      var $scope, $rootScope, $controller, controller, createController,
          populationIDs, population, individual0, individual1, lineage;
      
      beforeEach(inject(function($injector){
          $rootScope  = $injector.get('$rootScope');
          $controller = $injector.get('$controller');

          $scope      = $rootScope.$new();

          createController = function() {
              return $controller('PopulationCtrl', {
                  '$scope': $scope
              });
          };
          
          population = [individual0, individual1];
          individual0 = {id:0, data:{treeParams:{}, imageUrl:"foo.svg"}};
          individual1 = {id:1, data:{treeParams:{}, imageUrl:"bar.svg"}};          
      }));
      
      it('should have empty lineage', inject(function(Population,CurrentPopulation,Lineage) {
          populationIDs = [0];
          lineage = [];
          
          spyOn(CurrentPopulation, 'query').andReturn(populationIDs);
          spyOn(CurrentPopulation, 'push');
          spyOn(Population, 'queryAll').andReturn(population);
          spyOn(Lineage, 'query').andReturn(lineage);
     
          controller = createController();
          expect($scope.lineage).toEqual(lineage);
          expect($scope.selectedAncestor).not.toBeDefined();
          expect(CurrentPopulation.push).not.toHaveBeenCalled();
      }));

      it('should have one ancestor in lineage', inject(function(Population,CurrentPopulation,Lineage) {
          populationIDs = [0, 1];
          lineage = [{id:0, data:1, individual:individual1}];
          
          spyOn(CurrentPopulation, 'query').andReturn(populationIDs);
          spyOn(CurrentPopulation, 'push');
          spyOn(Population, 'queryAll').andReturn(population);
          spyOn(Lineage, 'query').andReturn(lineage);
     
          controller = createController();
          expect($scope.lineage).toEqual(lineage);
          expect($scope.selectedAncestor).not.toBeDefined();
          expect(CurrentPopulation.push).not.toHaveBeenCalled();
          
          expect($scope.selectAncestor).toBeDefined();
          $scope.selectAncestor(1);
          expect($scope.selectedAncestor).toEqual(1);
          expect($rootScope.selectedAncestor).toEqual(1);
      }));

      it('should have increased population size by 7',
       inject(function(Population,CurrentPopulation,Lineage,Image) {
          var controller, nextChildID, populationIDs, population;
          
          // For this test, we are faking individuals as simple integers.

          lineage = [];
          spyOn(Lineage, 'insertInto').andCallFake(function(id){lineage.push(id);});
          spyOn(Lineage, 'query').andReturn(lineage);

          populationIDs = [0,1];
          spyOn(CurrentPopulation, 'init').andCallFake(function(){populationIDs = [];});
          spyOn(CurrentPopulation, 'push').andCallFake(function(id){populationIDs.push(id);});
          spyOn(CurrentPopulation, 'query').andCallFake(function(){return populationIDs;});

          population = [0,1];
          nextChildID = 2;
          spyOn(Population, 'queryIDs').andCallFake(function(){return populationIDs;});
          spyOn(Population, 'reproduce').andCallFake(function(id){ return nextChildID++; });

          spyOn(Image, 'getByID');

          controller = createController();
          $scope.propagate(1);

          expect(Lineage.insertInto).toHaveBeenCalledWith(1);
          expect(CurrentPopulation.init).toHaveBeenCalled();
          expect(Image.getByID).toHaveBeenCalled();

          expect(populationIDs).toEqual([1,2,3,4,5,6,7,8]);
          expect($scope.population).toEqual([1,2,3,4,5,6,7,8]);
          expect($scope.lineage).toEqual([1]);
          expect($scope.selectedAncestor).not.toBeDefined();
      }));
  });
});
