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

appServices.factory('ConiferLib',
  function(){
      var is_array,
          _epsilon, epsilon, setEpsilon, equivWithin, equivZero, equiv, equivArrays,
          objDiff, arrayRelativeDiff, arrayRelativeDiff, arrayUnion,
          arrayIndex, arrayContains, randomKey, randomKeyExcept, randomNormalDist;
    
    // From Crockford. Works for arrays defined within window or frame.
    is_array = function(a) {
        return a && typeof a === 'object' && a.constructor === Array;
    }
    
    _epsilon = 1e-6;
    
    epsilon = function() {
        return _epsilon;
    }
    
    setEpsilon = function(e) {
        _epsilon = e;
    }
    
    equivWithin = function(n, e) {
        return n < e;
    };
    
    equivZero = function(n) {
        return equivWithin(n, _epsilon);
    };
    
    equiv = function(n1, n2) {
        if (typeof n1 == "number" && typeof n2 == "number"){
            return equivWithin(n2 - n1, _epsilon);
        } else if (typeof n1 == "undefined" && typeof n2 == "undefined") {
            return true;
        } else {
            return false;
        }
    };
    
    equivArrays = function(a1, a2) {
        var i;
        if (typeof a1 == "undefined" && typeof a2 == "undefined") {
            return true;
        }
        else if (is_array(a1) && is_array(a2)) {
            if (a1.length != a2.length) {
                return false;
            }
            
            for (i = 0; i < a1.length; ++i) {
                if (!equiv(a1[i], a2[i])) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
    
    // Shallow comparison of elem with array elements.
    // Returns element index in array, or -1 if element not in array.
    arrayIndex = function(arr, elem) {
        var i;
        for (i = 0; i < arr.length; ++i) {
            if (arr[i] == elem) {
                return i;
            }
        }
        return -1;
    };
    
    arrayContains = function(arr, elem) {
        return arrayIndex(arr, elem) != -1;
    }
    
    arrayUnion = function(arrs) {
        var result, i, j;
        result = [];
        for (i = 0; i < arrs.length; ++i) {
            for (j = 0; j < arrs[i].length; ++j) {
                if (!arrayContains(result, arrs[i][j])) {
                    result.push(arrs[i][j]);
                }
            }
        }
        return result;
    };
    
    arrayRelativeDiff = function(left, right) {
        var lenL, lenR, i, min, result;

        result = [];

        if (typeof left == "undefined") {
            lenL = 0;
        } else {
            lenL = left.length;
        }

        if (typeof right == "undefined") {
            lenR = 0;
        } else {
            lenR = right.length;
        }
        
        if (lenL == 0 && lenR == 0) {
            return result;
        }
        
        min = (lenL <= lenR) ? lenL : lenR;
        for (i = 0; i < min; ++i) {
            if (left[i] == right[i]) {
                result.push(0.0);
            } else if (left[i] == 0) {
                result.push(1.0); // By convention, but inconsistent math
            } else {
                result.push( (right[i] - left[i]) / left[i] );
            }
        }
        
        if (lenL > lenR) {
            for (i = min; i < lenL; ++i) {
                result.push(-1.0); // By convention, but inconsistent math
            }
        } else {
            for (i = min; i < lenR; ++i) {
                result.push(1.0); // By convention, but inconsistent math
            }
        }
        
        return result;
    };
    
    return {
          'epsilon': epsilon
        , 'setEpsilon': setEpsilon
        , 'equivWithin': equivWithin
        , 'equivZero': equivZero
        , 'equiv': equiv
        , 'equivArrays': equivArrays
        
        , 'arrayIndex': arrayIndex
        , 'arrayContains': arrayContains
        , 'arrayUnion': arrayUnion
        , 'arrayRelativeDiff': arrayRelativeDiff
    }
});