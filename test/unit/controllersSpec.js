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
  });


  xdescribe('PropagationCtrl', function() {
        var $controller, controller, createController, populationIDs,
            routeParams;
        
    
        beforeEach(inject(function($injector){
            $controller  = $injector.get('$controller');
            routeParams  = $injector.get('$routeParams');

            createController = function() {
                return $controller('PropagationCtrl', {
                    //'$scope': $scope
                });
            };
        }));
    
      
      
      it('should have increased population size by 3',
       inject(function(Population,CurrentPopulation,Lineage,Image) {
          var nextChildID;
          populationIDs = [];
          //spyOn($routeParams, 'id').andReturn(1);
          spyOn(Lineage, 'insertInto');
          spyOn(CurrentPopulation, 'init');
          spyOn(CurrentPopulation, 'push').andCallFake(function(id){populationIDs.push(id);});

          nextChildID = 2;
          spyOn(Population, 'reproduce').andCallFake(function(id){ return nextChildID++; });
          spyOn(Image, 'get');
          //spyOn($location, 'path');
          
          var controller = createController();
          
          expect(Lineage.insertInto).toBeCalledWith(1);
          expect(CurrentPopulation.init).toBeCalled();
          expect(populationIDs).toEqual([1,2,3,4]);
          expect(Image.get).toBeCalled();
          //expect($location.path).toBeCalledWith('/population');
      }));
      
  });
});
