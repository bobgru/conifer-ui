'use strict';

/* Services */


//var appServices = angular.module('myApp.services', ['ngResource']);
var appServices = angular.module('myApp.services',[]);

// Demonstrate how to register services
// In this case it is a simple value service.
appServices.value('version', '0.1');

appServices.factory('Specimens',
  function(){
      var data = {
          rows: []
      };
      
      var insertFunc, queryIDFunc, copySpecData, copyTreeParams,
          copyArray, mutateFunc;
      
      // Hardcode specimens for now. 
      // The specimens are the parent and its children.
      // The parent is at index 0.
      var default_specimen_data = [
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
          }

        //  , { "treeParams": { 
        //         "age": 2
        //       , "needles": false
        //       , "udTrunkLengthIncrementPerYear": 1.4
        //       , "udTrunkBranchLengthRatio": 0.6
        //       , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
        //       , "udTrunkGirth": 5.0
        //       , "udWhorlsPerYear": 4
        //       , "udWhorlSize": 5
        //       , "udBranchGirth": 1.0
        //       , "udBranchBranchLengthRatio": 1.0
        //       , "udBranchBranchLengthRatio2": 1.0
        //       }
        //       , "imageUrl": "img/specimen01.svg" 
        //   }
        // 
        // , { "treeParams": { 
        //         "age": 2
        //       , "needles": false
        //       , "udTrunkLengthIncrementPerYear": 1.45
        //       , "udTrunkBranchLengthRatio": 0.6
        //       , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
        //       , "udTrunkGirth": 5.0
        //       , "udWhorlsPerYear": 4
        //       , "udWhorlSize": 5
        //       , "udBranchGirth": 1.0
        //       , "udBranchBranchLengthRatio": 1.0
        //       , "udBranchBranchLengthRatio2": 1.0
        //       }
        //       , "imageUrl": "img/specimen02.svg" 
        //   }
        // 
        //   , { "treeParams": { 
        //           "age": 2
        //         , "needles": false
        //         , "udTrunkLengthIncrementPerYear": 1.35
        //         , "udTrunkBranchLengthRatio": 0.6
        //         , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
        //         , "udTrunkGirth": 5.0
        //         , "udWhorlsPerYear": 4
        //         , "udWhorlSize": 5
        //         , "udBranchGirth": 1.0
        //         , "udBranchBranchLengthRatio": 1.0
        //         , "udBranchBranchLengthRatio2": 1.0
        //         }
        //         , "imageUrl": "img/specimen03.svg" 
        //     }
        // 
        //     , { "treeParams": { 
        //             "age": 2
        //           , "needles": false
        //           , "udTrunkLengthIncrementPerYear": 1.4
        //           , "udTrunkBranchLengthRatio": 0.65
        //           , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
        //           , "udTrunkGirth": 5.0
        //           , "udWhorlsPerYear": 4
        //           , "udWhorlSize": 5
        //           , "udBranchGirth": 1.0
        //           , "udBranchBranchLengthRatio": 1.0
        //           , "udBranchBranchLengthRatio2": 1.0
        //           }
        //       , "imageUrl": "img/specimen04.svg" 
        //       }
        // 
        //       , { "treeParams": { 
        //               "age": 2
        //             , "needles": false
        //             , "udTrunkLengthIncrementPerYear": 1.35
        //             , "udTrunkBranchLengthRatio": 0.6
        //             , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
        //             , "udTrunkGirth": 5.0
        //             , "udWhorlsPerYear": 4
        //             , "udWhorlSize": 5
        //             , "udBranchGirth": 1.0
        //             , "udBranchBranchLengthRatio": 1.0
        //             , "udBranchBranchLengthRatio2": 1.0
        //             }
        //         , "imageUrl": "img/specimen05.svg" 
        //         }
        // 
        //         , { "treeParams": { 
        //                 "age": 2
        //               , "needles": false
        //               , "udTrunkLengthIncrementPerYear": 1.4
        //               , "udTrunkBranchLengthRatio": 0.65
        //               , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
        //               , "udTrunkGirth": 5.0
        //               , "udWhorlsPerYear": 4
        //               , "udWhorlSize": 5
        //               , "udBranchGirth": 1.0
        //               , "udBranchBranchLengthRatio": 1.0
        //               , "udBranchBranchLengthRatio2": 1.0
        //               }
        //           , "imageUrl": "img/specimen06.svg" 
        //           }
        // 
        //       , { "treeParams": { 
        //               "age": 2
        //             , "needles": false
        //             , "udTrunkLengthIncrementPerYear": 1.35
        //             , "udTrunkBranchLengthRatio": 0.6
        //             , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
        //             , "udTrunkGirth": 5.0
        //             , "udWhorlsPerYear": 4
        //             , "udWhorlSize": 5
        //             , "udBranchGirth": 1.0
        //             , "udBranchBranchLengthRatio": 1.0
        //             , "udBranchBranchLengthRatio2": 1.0
        //             }
        //         , "imageUrl": "img/specimen07.svg" 
        //         }
      ];

      insertFunc = function(specimenData) {
            var i = data.rows.length;
            data.rows.push({id: i, data: specimenData});
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
            }
            else if (key != "age" && key != "needles") {
                // specData.treeParams.udTrunkLengthIncrementPerYear *= 1.1;
                pct = randomPercent(0.2);
                specData.treeParams[key] *= pct;
            }
        };
        
      default_specimen_data.forEach(function(specimenData){
          insertFunc(specimenData);
      });
      
      
      return {
          init: function() {
              data = {rows: []};
          }
          , insertInto: insertFunc
          
          , deleteID: function(i) {
              // find element of data.rows with id = i, slice it out
              
          }
          , updateID: function(i, obj) {
              // find element of data.rows with id = i, replace data w/ obj
              
          }
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
          , queryAll: function() {
              return data.rows; // Returning alias!
          }
          , reproduce: function(parentID) {
              var parentSpec, newSpecData;
              parentSpec = queryIDFunc(parentID);
              newSpecData = copySpecData(parentSpec.data);
              mutateFunc(newSpecData);
              return insertFunc(newSpecData);
          }
          , copySpecimen: copySpecData
    };

  });

appServices.factory('Lineage',
    function(){
        var data = {
            rows: []
        };

        return {
            init: function() {
                data = {rows: []};
            }
            , insertInto: function(specimenId) {
                  var i = data.rows.length;
                  data.rows.push({id: i, data: specimenId});
                  return i;
            }
            , deleteID: function(i) {
                // find element of data.rows with id = i, slice it out

            }
            , updateID: function(i, obj) {
                // find element of data.rows with id = i, replace data w/ obj

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
            , queryIDs: function(ids) {
                // find the elements of data.rows for the ids and return
            }
            , queryLast: function() {
                if (data.rows.length > 0) {
                    return data.rows[data.rows.length - 1]
                } else {
                    return null; // Better way?
                }
            }
            , queryAll: function() {
                return data.rows; // Returning alias!
            }
      };
});

