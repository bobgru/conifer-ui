'use strict';

/* Services */


var appServices = angular.module('myApp.services', ['ngResource']);
//var appServices = angular.module('myApp.services',[]);

// Demonstrate how to register services
// In this case it is a simple value service.
appServices.value('version', '0.1');

appServices.factory('Population',
  function(){
      var data = {
          rows: []
      };
      
      var insertFunc, queryIDFunc, copySpecData, copyTreeParams,
          copyArray, mutateFunc;
      
      // Hardcode an initial population of one.
      var default_individual_data = [
          { "treeParams": { 
              "age": 2
              , "needles": false
              , "udTrunkLengthIncrementPerYear": 1.4
              , "udTrunkBranchLengthRatio": 0.65
              , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
              , "udTrunkGirth": 5.0
              , "udWhorlsPerYear": 4
              , "udWhorlSize": 5
              , "udBranchGirth": 1.0
              , "udBranchBranchLengthRatio": 1.0
              , "udBranchBranchLengthRatio2": 1.0
              }
              , "imageUrl": "img/specimen00.svg"
              , "dirty": false
          }
      ];

      insertFunc = function(individualData) {
            var i = data.rows.length;
            data.rows.push({id: i, data: individualData});
            return i;
        };

        queryIDFunc = function(id) {
            var match = null;
            data.rows.forEach(function(item){
                if (item.id == id) {
                    match = item;
                }
            });
            return match;
        };
        
        copySpecData = function(specData) {
            var newSpecData = {};
            newSpecData.treeParams = copyTreeParams(specData.treeParams);
            newSpecData.imageUrl = "";
            newSpecData.dirty = true;
            return newSpecData;
        };
        
        copyTreeParams = function(tp) {
            var newTP = {};
            newTP.age = tp.age;
            newTP.needles = tp.needles;
            newTP.udTrunkLengthIncrementPerYear = tp.udTrunkLengthIncrementPerYear;
            newTP.udTrunkBranchLengthRatio = tp.udTrunkBranchLengthRatio;
            newTP.udTrunkBranchAngles = copyArray(tp.udTrunkBranchAngles);
            newTP.udTrunkGirth = tp.udTrunkGirth;
            newTP.udWhorlsPerYear = tp.udWhorlsPerYear;
            newTP.udWhorlSize = tp.udWhorlSize;
            newTP.udBranchGirth = tp.udBranchGirth;
            newTP.udBranchBranchLengthRatio = tp.udBranchBranchLengthRatio;
            newTP.udBranchBranchLengthRatio2 = tp.udBranchBranchLengthRatio2;
            return newTP;
        };
        
        // Shallow copy of array.
        copyArray = function(arr) {
            var newArr = [];
            for (var i = 0; i < arr.length; ++i) {
                newArr[i] = arr[i];
            }
            return newArr;
        };
        
        // Mutates in-place.
        mutateFunc = function(specData) {
            var pct;
            var randomProperty = function (obj) {
                var keys = Object.keys(obj)
                return keys[ keys.length * Math.random() << 0];
            };
            var randomPercent = function (amplitude) {
                return 1 + (Math.random() * 2 * amplitude - amplitude);
            };
            
            var key = randomProperty(specData.treeParams);
            if (key == "udTrunkBranchAngles") {
                var index = Math.floor(Math.random() * 
                    specData.treeParams.udTrunkBranchAngles.length);
                pct = randomPercent(0.2);
                specData.treeParams.udTrunkBranchAngles[index] *= pct;
                specData.dirty = true;
            }
            else if (key != "age" && key != "needles") {
                // specData.treeParams.udTrunkLengthIncrementPerYear *= 1.1;
                pct = randomPercent(0.2);
                specData.treeParams[key] *= pct;
                specData.dirty = true;
            }
        };
        
      default_individual_data.forEach(function(individualData){
          insertFunc(individualData);
      });
      
      
      return {
          init: function() {
              data = {rows: []};
          }
          , insertInto: insertFunc
          , queryID: queryIDFunc
          , queryIDs: function(ids) {
              var result = [];
              ids.forEach(function(id){
                  var spec = queryIDFunc(id);
                  if (spec != null) {
                      result.push(spec);
                  }
              });
              return result;
          }
          , reproduce: function(parentID) {
              var parentSpec, newSpecData;
              parentSpec = queryIDFunc(parentID);
              newSpecData = copySpecData(parentSpec.data);
              mutateFunc(newSpecData);
              return insertFunc(newSpecData);
          }
          , copyIndividual: copySpecData
    };
  });

appServices.factory('CurrentPopulation',
    function(){
        var populationIDs;
        populationIDs = [];

        return {
            init: function() {
                populationIDs = [];
            }
            , push: function(id) {
                  populationIDs.push(id);
            }
            , query: function() {
                return populationIDs;
            }
        };
    });


appServices.factory('Lineage', [ 'Population',
    function(Population){
        var data;
        
        data = { rows: [] };
        
        return {
            init: function() {
                data = { rows: [] };
            }
            , insertInto: function(individualID) {
                  var individual, linID, linObj;

                  individual = Population.queryID(individualID);
                  linID = data.rows.length;
                  linObj = {id: linID, data: individualID, individual: individual};
                  
                  data.rows.push(linObj);
                  
                  return linID;
            }
            , queryID: function(id) {
                var match;
                data.rows.forEach(function(item){
                    if (item.id == id) {
                        match = item;
                    }
                });
                return match;
            }
            , queryLast: function() {
                if (data.rows.length > 0) {
                    return data.rows[data.rows.length - 1]
                } else {
                    return null; // Better way?
                }
            }
            , query: function() {
                return data.rows; // Returning alias!
            }
      };
}]);

appServices.factory('Image', [ '$http', 'Population', 
    function($http, Population){

        return {
            get: function(individualData) {
                var getImage, setImage;

                setImage = function(specData, data) {
                    specData.imageUrl = "img/" + data;
                };

                getImage = function(tp, ok) {
                    $http({ method : 'POST',
                            url : 'conifer/draw',
                            data : 'userdata=' + angular.toJson(tp),
                            headers: {'Content-Type':
                                'application/x-www-form-urlencoded'}
                        }).success(ok);
                };

                getImage(individualData.treeParams,
                    function(data, status, headers, config){
                        setImage(individualData, data);
                    });
            }
            
            , getByID: function(id) {
                var individual, individualData, getImage, setImage;

                setImage = function(specData, data) {
                    specData.imageUrl = "img/" + data;
                };

                getImage = function(tp, ok) {
                    $http({ method : 'POST',
                            url : 'conifer/draw',
                            data : 'userdata=' + angular.toJson(tp),
                            headers: {'Content-Type':
                                'application/x-www-form-urlencoded'}
                        }).success(ok);
                };

                individual = Population.queryID(id);
                individualData = individual.data;
                getImage(individualData.treeParams,
                    function(data, status, headers, config){
                        setImage(individualData, data);
                    });
            }
            
        };
    }]);

