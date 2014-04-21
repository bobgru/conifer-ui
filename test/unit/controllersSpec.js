'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('myApp.controllers'));
  beforeEach(module('myApp.services'));
  beforeEach(module('ngRoute'));
  beforeEach(module('ngResource'));
  

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
  
  describe('ViewCtrl', function() {
      var $scope, $rootScope, $controller, controller, createController,
          individual0;
      
      beforeEach(inject(function($injector){
          $rootScope  = $injector.get('$rootScope');
          $controller = $injector.get('$controller');

          $scope      = $rootScope.$new();

          createController = function() {
              return $controller('ViewCtrl', {
                  '$scope': $scope
              });
          };
          
          individual0 = {id:0, data:{treeParams:{}, imageUrl:"foo.svg"}};
      }));
      
      it('should get data for individual', inject(function(Population,Lineage) {
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
     
          controller = createController();
          expect($scope.view).toEqual(true);
          expect($scope.individualData).toEqual(individual0.data);
      }));

      it('.experiment should go to ExperimentCtrl',
        inject(function(Population,Lineage,$location,$routeParams) {
            
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
          spyOn($location, 'path').andReturn();
     
          $routeParams.id = 0; // it's just a map, so assign the value.
     
          controller = createController();
          $scope.experiment();
          expect($location.path).toHaveBeenCalledWith('/experiment/0')
          expect($scope.view).toEqual(true);
          expect($scope.individualData).toEqual(individual0.data);
      }));
  });
  
  describe('ExperimentCtrl', function() {
      var $scope, $rootScope, $controller, controller, createController,
          individual0, individual1;
      
      beforeEach(inject(function($injector){
          $rootScope  = $injector.get('$rootScope');
          $controller = $injector.get('$controller');

          $scope      = $rootScope.$new();

          createController = function() {
              return $controller('ExperimentCtrl', {
                  '$scope': $scope
              });
          };
          
          individual0 = {id:0, data:{treeParams:{ foo:"bar"}, imageUrl:"foo.svg"}};
          individual1 = {id:1, data:{treeParams:{ foo:"bar"}, imageUrl:""}};
      }));
      
      it('should copy data for individual', inject(function(Population,Lineage) {
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Population, 'copyIndividual').andReturn(individual1.data);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
     
          controller = createController();
          expect($scope.view).toEqual(false);
          expect($scope.individualData.treeParams).toEqual(individual1.data.treeParams);
          expect($scope.individualData.imageUrl).toEqual("foo.svg");
      }));

      it('.test should update imageUrl', inject(function(Population,Lineage,Image) {
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Population, 'copyIndividual').andReturn(individual1.data);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
          spyOn(Image, 'get').andCallFake(function() {
              individual1.data.imageUrl = "zot.svg";
          });
     
          controller = createController();
          $scope.test();
          expect(Image.get).toHaveBeenCalled();
          expect($scope.individualData.imageUrl).toEqual("zot.svg");
      }));

      it('.destroy should return to ViewCtrl', 
        inject(function(Population,Lineage,Image,$location,$routeParams) {

          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Population, 'copyIndividual').andReturn(individual1.data);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
          spyOn(Image, 'get').andCallFake(function() {
              individual1.data.imageUrl = "zot.svg";
          });
          spyOn($location,'path').andReturn();

          $routeParams.id = 1; // it's just a map, so assign the value.
     
          controller = createController();
          $scope.destroy();
          expect($location.path).toHaveBeenCalledWith("/view/1");
      }));

      it('.propagate should reinitialize population and lineage',
        inject(function(Population, CurrentPopulation,Lineage,Image,$location) {
        
          spyOn(Population, 'init').andReturn();
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Population, 'copyIndividual').andReturn(individual1.data);
          spyOn(Population, 'insertInto').andReturn(2);
          
          spyOn(CurrentPopulation, 'init').andReturn();
          spyOn(CurrentPopulation, 'push').andReturn();
                    
          spyOn(Lineage, 'queryLast').andReturn(individual0);
          spyOn(Lineage, 'init').andReturn();
          
          spyOn(Image, 'getByID').andReturn();
          spyOn($location,'path').andReturn();
     
          controller = createController();
          $scope.propagate();
          expect(Lineage.init).toHaveBeenCalled();
          expect(Population.init).toHaveBeenCalled();
          expect(CurrentPopulation.init).toHaveBeenCalled();
          expect(Population.insertInto).toHaveBeenCalledWith(individual1.data);
          expect(CurrentPopulation.push).toHaveBeenCalledWith(2);
          expect(Image.getByID).toHaveBeenCalledWith(2);
          expect($location.path).toHaveBeenCalledWith("/population");
      }));
  });
  
});
