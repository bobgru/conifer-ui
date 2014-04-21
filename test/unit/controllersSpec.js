'use strict';

/* jasmine specs for controllers go here */

describe('Controller', function(){
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
          
          individual0 = {id:0, data:{treeParams:{}, imageUrl:"foo.svg", dirty: false}};
          individual1 = {id:1, data:{treeParams:{}, imageUrl:"bar.svg", dirty: false}};          
      }));
      
      it('should have empty lineage', inject(function(Population,CurrentPopulation,Lineage) {
          populationIDs = [0];
          population = [individual0];
          lineage = [];
          
          spyOn(CurrentPopulation, 'query').andReturn(populationIDs);
          spyOn(CurrentPopulation, 'push');
          spyOn(Population, 'queryIDs').andReturn(population);
          spyOn(Lineage, 'query').andReturn(lineage);
     
          controller = createController();

          // Verify no individuals were added to population.
          expect(CurrentPopulation.push).not.toHaveBeenCalled();

          // Check the scope variables.
          expect($scope.lineage).toEqual(lineage);
          expect($scope.population).toEqual(population);
          expect($scope.selectedAncestor).not.toBeDefined();
          
          // Fetching the current population doesn't invalidate images.
          expect($scope.population[0].data.dirty).toEqual(false);
      }));

      it('should have one ancestor in lineage', inject(function(Population,CurrentPopulation,Lineage) {
          populationIDs = [0, 1];
          population = [individual0, individual1];
          lineage = [{id:0, data:1, individual:individual1}];
          
          spyOn(CurrentPopulation, 'query').andReturn(populationIDs);
          spyOn(CurrentPopulation, 'push');
          spyOn(Population, 'queryIDs').andReturn(population);
          spyOn(Lineage, 'query').andReturn(lineage);
     
          controller = createController();
          
          // Verify no individuals were added to population.
          expect(CurrentPopulation.push).not.toHaveBeenCalled();

          // Check the scope variables.
          expect($scope.lineage).toEqual(lineage);
          expect($scope.population).toEqual(population);
          expect($scope.selectedAncestor).not.toBeDefined();
          expect($scope.selectAncestor).toBeDefined();

          $scope.selectAncestor(1);
          expect($scope.selectedAncestor).toEqual(1);
          expect($rootScope.selectedAncestor).toEqual(1);

          // Selecting ancestor doesn't invalidate images.
          expect($scope.population[0].data.dirty).toEqual(false);
          expect($scope.population[1].data.dirty).toEqual(false);
      }));

      it('should have increased population size by 7',
       inject(function(Population,CurrentPopulation,Lineage,Image) {
          var controller, nextChildID, children;
          
          populationIDs = [0,1];
          population = [individual0, individual1];
          nextChildID = 2;

          children = [
              {id:2, data:{treeParams:{}, imageUrl:"bar.svg", dirty: false}}
            , {id:3, data:{treeParams:{}, imageUrl:"bar.svg", dirty: false}}
            , {id:4, data:{treeParams:{}, imageUrl:"bar.svg", dirty: false}}
            , {id:5, data:{treeParams:{}, imageUrl:"bar.svg", dirty: false}}
            , {id:6, data:{treeParams:{}, imageUrl:"bar.svg", dirty: false}}
            , {id:7, data:{treeParams:{}, imageUrl:"bar.svg", dirty: false}}
            , {id:8, data:{treeParams:{}, imageUrl:"bar.svg", dirty: false}}
          ];

          lineage = [];

          // Faking lineage as array of integers.
          spyOn(Lineage, 'insertInto').andCallFake(function(id){lineage.push(id);});
          spyOn(Lineage, 'query').andReturn(lineage);

          spyOn(CurrentPopulation, 'init').andCallFake(function(){populationIDs = [];});
          spyOn(CurrentPopulation, 'push').andCallFake(function(id){populationIDs.push(id);});
          spyOn(CurrentPopulation, 'query').andCallFake(function(){return populationIDs;});

          // Individuals in population need to have dirty bits for testing.
          spyOn(Population, 'queryIDs').andCallFake(function(){return population;});
          spyOn(Population, 'queryID').andCallFake(function(id){
              var result;
              result = null;
              population.forEach(function(individual) {
                  if (individual.id == id)
                    result = individual;
              });
              return result;
            });
          spyOn(Population, 'reproduce').andCallFake(function(id){
              var child = children[-2 + nextChildID++];
              population.push(child);
              return child.id;
            });

          spyOn(Image, 'getByID');

          controller = createController();
          $scope.propagate(1);

          expect(Lineage.insertInto).toHaveBeenCalledWith(1);
          expect(CurrentPopulation.init).toHaveBeenCalled();
          expect(Image.getByID).toHaveBeenCalled();

          // Check scope variables.
          expect($scope.lineage).toEqual([1]);
          expect($scope.population.map(function(individual) {
              return individual.id;
          })).toEqual([0, 1,2,3,4,5,6,7,8]);
          expect($scope.selectedAncestor).not.toBeDefined();
          
          // Verify that no dirty bits are set.
          // TODO: should fold with "and" and check the result is false.
          expect($scope.population.map(function(individual) {
              return individual.data.dirty;
          })).toEqual([false, false, false, false, false, false, false, false, false]);
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
          
          individual0 = {id:0, data:{treeParams:{}, imageUrl:"foo.svg", dirty: false}};
      }));
      
      it('should get data for individual', inject(function(Population,Lineage) {
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
     
          controller = createController();
          expect($scope.view).toEqual(true);
          expect($scope.individualData).toEqual(individual0.data);
          expect($scope.individualData.dirty).toEqual(false);
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

          // Nothing has changed yet, so the dirty bit should be false.
          expect($scope.individualData.dirty).toEqual(false);
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
          
          individual0 = {id:0, data:{treeParams:{ age: 1, foo:"bar"}, imageUrl:"foo.svg", dirty:false}};
          individual1 = {id:1, data:{treeParams:{ age: 1, foo:"bar"}, imageUrl:"", dirty:true}};
      }));
      
      it('should copy data for individual', inject(function(Population,Lineage) {
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Population, 'copyIndividual').andReturn(individual1.data);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
     
          controller = createController();
          expect($scope.view).toEqual(false);
          expect($scope.individualData.treeParams).toEqual(individual1.data.treeParams);
          expect($scope.individualData.imageUrl).toEqual("foo.svg");

          // Nothing has changed yet, so the dirty bit should be false.
          expect($scope.individualData.dirty).toEqual(false);
      }));

      it('should set dirty bit on change of treeParams', inject(function(Population,Lineage) {
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Population, 'copyIndividual').andReturn(individual1.data);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
     
          controller = createController();
          
          // Nothing changed yet, so dirty bit should be false.
          expect($scope.individualData.dirty).toEqual(false);

          $scope.individualData.treeParams.age += 1;
          $scope.$digest();
          
          // console.log('cS post-digest: $scope.individualData.treeParams.age = ' +
          //              $scope.individualData.treeParams.age);

          expect($scope.view).toEqual(false);
          expect($scope.individualData.treeParams).toEqual(individual1.data.treeParams);
          expect($scope.individualData.treeParams.age).toEqual(2);
          expect($scope.individualData.imageUrl).toEqual("foo.svg");

          // The treeParams watcher should have set the dirty bit.
          expect($scope.individualData.dirty).toEqual(true);
      }));

      it('.test should update imageUrl', inject(function(Population,Lineage,Image) {
          spyOn(Population, 'queryID').andReturn(individual0);
          spyOn(Population, 'copyIndividual').andReturn(individual1.data);
          spyOn(Lineage, 'queryLast').andReturn(individual0);
          spyOn(Image, 'get').andCallFake(function() {
              individual1.data.imageUrl = "zot.svg";
          });
     
          controller = createController();

          // Set the dirty bit to indicate some change has happened to parameters.
          $scope.individualData.dirty = true;

          $scope.test();

          // The new imageUrl should be there and the dirty bit should have been cleared.
          expect(Image.get).toHaveBeenCalled();
          expect($scope.individualData.imageUrl).toEqual("zot.svg");
          expect($scope.individualData.dirty).toEqual(false);
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
          expect($scope.individualData.dirty).toEqual(false);
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
          expect(Image.getByID).not.toHaveBeenCalled(); // b/c dirty bit not set
          expect($scope.individualData.dirty).toEqual(false);
          expect($location.path).toHaveBeenCalledWith("/population");
      }));
  });
  
});
