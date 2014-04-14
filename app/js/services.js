'use strict';

/* Services */


var appServices = angular.module('myApp.services', ['ngResource']);

// Demonstrate how to register services
// In this case it is a simple value service.
appServices.value('version', '0.1');

appServices.factory('Specimens',
  function(){
      var data = {
          rows: []
      };
      
      var insertFunc;
      
      // Hardcode specimens for now. 
      // The specimens are the parent and its children.
      // The parent is at index 0.
      var default_specimens = [
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

         , { "treeParams": { 
                "age": 2
              , "needles": false
              , "udTrunkLengthIncrementPerYear": 1.4
              , "udTrunkBranchLengthRatio": 0.6
              , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
              , "udTrunkGirth": 5.0
              , "udWhorlsPerYear": 4
              , "udWhorlSize": 5
              , "udBranchGirth": 1.0
              , "udBranchBranchLengthRatio": 1.0
              , "udBranchBranchLengthRatio2": 1.0
              }
              , "imageUrl": "img/specimen01.svg" 
          }

        , { "treeParams": { 
                "age": 2
              , "needles": false
              , "udTrunkLengthIncrementPerYear": 1.45
              , "udTrunkBranchLengthRatio": 0.6
              , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
              , "udTrunkGirth": 5.0
              , "udWhorlsPerYear": 4
              , "udWhorlSize": 5
              , "udBranchGirth": 1.0
              , "udBranchBranchLengthRatio": 1.0
              , "udBranchBranchLengthRatio2": 1.0
              }
              , "imageUrl": "img/specimen02.svg" 
          }

          , { "treeParams": { 
                  "age": 2
                , "needles": false
                , "udTrunkLengthIncrementPerYear": 1.35
                , "udTrunkBranchLengthRatio": 0.6
                , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
                , "udTrunkGirth": 5.0
                , "udWhorlsPerYear": 4
                , "udWhorlSize": 5
                , "udBranchGirth": 1.0
                , "udBranchBranchLengthRatio": 1.0
                , "udBranchBranchLengthRatio2": 1.0
                }
                , "imageUrl": "img/specimen03.svg" 
            }

            , { "treeParams": { 
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
              , "imageUrl": "img/specimen04.svg" 
              }

              , { "treeParams": { 
                      "age": 2
                    , "needles": false
                    , "udTrunkLengthIncrementPerYear": 1.35
                    , "udTrunkBranchLengthRatio": 0.6
                    , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
                    , "udTrunkGirth": 5.0
                    , "udWhorlsPerYear": 4
                    , "udWhorlSize": 5
                    , "udBranchGirth": 1.0
                    , "udBranchBranchLengthRatio": 1.0
                    , "udBranchBranchLengthRatio2": 1.0
                    }
                , "imageUrl": "img/specimen05.svg" 
                }

                , { "treeParams": { 
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
                  , "imageUrl": "img/specimen06.svg" 
                  }

              , { "treeParams": { 
                      "age": 2
                    , "needles": false
                    , "udTrunkLengthIncrementPerYear": 1.35
                    , "udTrunkBranchLengthRatio": 0.6
                    , "udTrunkBranchAngles": [ 0.698, 0.898, 1.31 , 0.967 ]
                    , "udTrunkGirth": 5.0
                    , "udWhorlsPerYear": 4
                    , "udWhorlSize": 5
                    , "udBranchGirth": 1.0
                    , "udBranchBranchLengthRatio": 1.0
                    , "udBranchBranchLengthRatio2": 1.0
                    }
                , "imageUrl": "img/specimen07.svg" 
                }
      ];

      insertFunc = function(obj) {
            var i = data.rows.length;
            data.rows.push({id: i, data: obj});
            return i;
        };
        
      default_specimens.forEach(function(specimen){
          insertFunc(specimen);
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
          , queryAll: function() {
              return data.rows; // Returning alias!
          }
    };

  });
