'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('myApp.services'));


  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });

  describe('ConiferLib', function(){
      beforeEach(inject(function(ConiferLib) {
          this.addMatchers({
             toBeEquiv: function(expected) {
               return ConiferLib.equiv(this.actual, expected);
             },
             toBeEquivArrays: function(expected) {
               return ConiferLib.equivArrays(this.actual, expected);
             },
             toBeEquivRelativeDiffs: function(expected) {
               return ConiferLib.equivArrays(this.actual.relDiff, expected.relDiff) &&
                      ConiferLib.equivArrays(this.actual.added, expected.added) &&
                      ConiferLib.equivArrays(this.actual.deleted, expected.deleted);
             },
             toBeEquivObjRelativeDiffs: function(expected) {
               return ConiferLib.equivObjects(this.actual, expected);
             }
          });
          ConiferLib.setEpsilon(1e-6);
      }));
      
      describe('isArray', function() {
          it('should return true for empty array', inject(function(ConiferLib) {
              expect(ConiferLib.isArray([])).toEqual(true);
          }));
          it('should return true for nonempty array', inject(function(ConiferLib) {
              expect(ConiferLib.isArray([1,2,3])).toEqual(true);
          }));
          it('should return true for nested arrays', inject(function(ConiferLib) {
              expect(ConiferLib.isArray([[1,2,3]])).toEqual(true);
          }));
          it('should return true for nested array of objects', inject(function(ConiferLib) {
              expect(ConiferLib.isArray([[{a: 1}, {b: 2}, {c: 3}]])).toEqual(true);
          }));
          it('should return false for empty object', inject(function(ConiferLib) {
              expect(ConiferLib.isArray({})).toEqual(false);
          }));
          it('should return false for non-empty object', inject(function(ConiferLib) {
              expect(ConiferLib.isArray({a: "a"})).toEqual(false);
          }));
          it('should return false for number', inject(function(ConiferLib) {
              expect(ConiferLib.isArray(1)).toEqual(false);
          }));
          it('should return false for string', inject(function(ConiferLib) {
              expect(ConiferLib.isArray("")).toEqual(false);
          }));
          it('should return false for function', inject(function(ConiferLib) {
              expect(ConiferLib.isArray(function () {})).toEqual(false);
          }));
          it('should return false for undefined', inject(function(ConiferLib) {
              expect(ConiferLib.isArray()).toEqual(false);
          }));
          it('should return false for boolean', inject(function(ConiferLib) {
              expect(ConiferLib.isArray(false)).toEqual(false);
          }));
      });
      
      describe('epsilon', function() {
          it('should be settable', inject(function(ConiferLib) {
              expect(ConiferLib.epsilon(ConiferLib.setEpsilon(123))).toEqual(123);
          }));
          it('should take absolute value', inject(function(ConiferLib) {
              expect(ConiferLib.epsilon(ConiferLib.setEpsilon(-123))).toEqual(123);
          }));
      });
      
      describe('equivZeroWithin', function() {
          it('should reject', inject(function(ConiferLib) {
              expect(ConiferLib.equivZeroWithin(10, 5)).toEqual(false);
          }));
          it('should accept', inject(function(ConiferLib) {
              expect(ConiferLib.equivZeroWithin(5, 10)).toEqual(true);
          }));
          it('should accept when negative', inject(function(ConiferLib) {
              expect(ConiferLib.equivZeroWithin(-5, 10)).toEqual(true);
          }));
          it('should accept at edge', inject(function(ConiferLib) {
              expect(ConiferLib.equivZeroWithin(5, 5)).toEqual(true);
          }));
      });
      
      describe('equivZero', function() {
          it('should reject', inject(function(ConiferLib) {
              expect(ConiferLib.equivZero(0.00001)).toEqual(false);
          }));
          it('should accept', inject(function(ConiferLib) {
              expect(ConiferLib.equivZero(0.000000999999)).toEqual(true);
          }));
          it('should accept when negative', inject(function(ConiferLib) {
              expect(ConiferLib.equivZero(-0.000000999999)).toEqual(true);
          }));
          it('should accept at edge', inject(function(ConiferLib) {
              expect(ConiferLib.equivZero(0.000001)).toEqual(true);
          }));
      });
      
      describe('equiv', function() {
          it('should reject', inject(function(ConiferLib) {
              expect(ConiferLib.equiv(1.00001, 1.00002)).toEqual(false);
          }));
          it('should accept', inject(function(ConiferLib) {
              expect(ConiferLib.equiv(1.0000001, 1.0000002)).toEqual(true);
          }));
          it('should accept in other order', inject(function(ConiferLib) {
              expect(ConiferLib.equiv(1.0000002, 1.0000001)).toEqual(true);
          }));
          it('should accept at edge', inject(function(ConiferLib) {
              expect(ConiferLib.equiv(1.000001, 1.00000099999999)).toEqual(true);
          }));
          it('should accept Infinity', inject(function(ConiferLib) {
              expect(ConiferLib.equiv(Infinity, Infinity)).toEqual(true);
          }));
          it('should accept negative Infinity', inject(function(ConiferLib) {
              expect(ConiferLib.equiv(-Infinity, -Infinity)).toEqual(true);
          }));
          it('should reject opposite Infinities', inject(function(ConiferLib) {
              expect(ConiferLib.equiv(Infinity, -Infinity)).toEqual(false);
          }));
      });
      
      describe('equivArrays', function() {
          it('should accept empty and empty', inject(function(ConiferLib) {
              expect(ConiferLib.equivArrays([],[])).toEqual(true);
          }));
          it('should accept identical non-empty arrays', inject(function(ConiferLib) {
              expect(ConiferLib.equivArrays([1,2,3],[1,2,3])).toEqual(true);
          }));
          it('should accept identical non-empty arrays at edge', inject(function(ConiferLib) {
              expect(ConiferLib.equivArrays([1,2.000001,3],[1,2.000002,3])).toEqual(true);
          }));
          it('should reject when left array is larger', inject(function(ConiferLib) {
              expect(ConiferLib.equivArrays([1,2],[1])).toEqual(false);
          }));
          it('should reject when right array is larger', inject(function(ConiferLib) {
              expect(ConiferLib.equivArrays([1],[1,2])).toEqual(false);
          }));
          it('should reject when numbers are not equivalent', inject(function(ConiferLib) {
              expect(ConiferLib.equivArrays([1,2.000001],[1,2.000003])).toEqual(false);
          }));
      });
      
      describe('equivObjects', function() {
          it('should accept empty and empty', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({},{})).toEqual(true);
          }));
          it('should accept identical non-empty single-level objects', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({a:1,b:"a",c:3}, {a:1,b:"a",c:3})).toEqual(true);
          }));
          it('should reject when left object has more keys', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({a:1,b:"a",c:3}, {a:1,b:"a"})).toEqual(false);
          }));
          it('should reject when right object has more keys', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({a:1,b:"a"}, {a:1,b:"a",c:3})).toEqual(false);
          }));
          it('should accept when numbers are equivalent', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({a:1,b:"a",c:3}, {a:1.000001,b:"a",c:3})).toEqual(true);
          }));
          it('should reject when numbers are not equivalent', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({a:1,b:"a",c:3}, {a:1.000002,b:"a",c:3})).toEqual(false);
          }));
          it('should accept nested objects', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({a:1,b:{d:4,e:5},c:3},
                  {a:1,b:{d:4,e:5},c:3})).toEqual(true);
          }));
          it('should reject different nested objects', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({a:1,b:{d:4,e:5},c:3},
                  {a:1,b:{d:4,e:6},c:3})).toEqual(false);
          }));
          it('should accept nested objects within tolerance', inject(function(ConiferLib) {
              expect(ConiferLib.equivObjects({a:1,b:{d:4,e:5},c:3},
                  {a:1,b:{d:4,e:5.0000001},c:3})).toEqual(true);
          }));
      });
      
      describe('arrayIndex', function() {
          it('should return -1 for empty array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayIndex([], 1)).toEqual(-1);
          }));
          it('should return -1 for element not in non-empty array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayIndex([0,1], 2)).toEqual(-1);
          }));
          it('should return 0 if element head of array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayIndex([1], 1)).toEqual(0);
          }));
          it('should return element index in non-empty array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayIndex([0,1], 1)).toEqual(1);
          }));
      });

      describe('arrayContains', function() {
          it('should return false for empty array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayContains([], 1)).toEqual(false);
          }));
          it('should return false for element not in non-empty array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayContains([0,1], 2)).toEqual(false);
          }));
          it('should return true if element in singleton array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayContains([1], 1)).toEqual(true);
          }));
          it('should return true if element in non-empty array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayContains([0,1], 1)).toEqual(true);
          }));
      });

      describe('arrayUnion', function() {
          it('should return empty for empty array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayUnion([])).toEqual([]);
          }));
          it('should return empty for list of empty arrays', inject(function(ConiferLib) {
              expect(ConiferLib.arrayUnion([[], [], []])).toEqual([]);
          }));
          it('should return all elements if given one array of unique elements',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayUnion([[1,2,3]])).toEqual([1,2,3]);
          }));
          it('should return unique elements of singleton array', inject(function(ConiferLib) {
              expect(ConiferLib.arrayUnion([[0,1,1,0]])).toEqual([0,1]);
          }));
          it('should return unique elements across all input arrays', inject(function(ConiferLib) {
              expect(ConiferLib.arrayUnion([[0,1],[0,2]])).toEqual([0,1,2]);
          }));
      });

      describe('arrayRelativeDiff', function() {
          it('should return empty for empty arrays', inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([],[])).
                toBeEquivRelativeDiffs({relDiff:[], added:[], deleted:[]});
          }));
          it('should return zeroes for identical arrays', inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,2,3], [1,2,3])).
                toBeEquivRelativeDiffs({relDiff:[0,0,0], added:[], deleted:[]});
          }));
          it('should indicate elements in right array beyond length of left array',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1], [1,2,3])).
                toBeEquivRelativeDiffs({relDiff:[0], added:[2,3], deleted:[]});
          }));
          it('should indicate elements in left array beyond length of right array',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,2,3], [1])).
                toBeEquivRelativeDiffs({relDiff:[0], added:[], deleted:[2,3]});
          }));
          it('should return relative difference for elements at shared indices',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,1,1], [1.1,1.2,1.3])).
                toBeEquivRelativeDiffs({relDiff:[0.1,0.2,0.3], added:[], deleted:[]});
          }));
          it('should return Infinity for relative difference from 0',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([0, 0], [10, -10])).
                toBeEquivRelativeDiffs({relDiff:[Infinity, -Infinity], added:[], deleted:[]});
          }));
      });

      describe('objRelativeDiff', function() {
          it('should return empty for empty objects', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({},{})).
                toBeEquivObjRelativeDiffs({relDiff:{}, added:{}, deleted:{}});
          }));
          it('should return zeroes for identical objects', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:2,c:3}, {a:1,b:2,c:3})).
                toBeEquivObjRelativeDiffs({relDiff:{a:0,b:0,c:0}, added:{}, deleted:{}});
          }));
          it('should indicate keys in right object but not in left',
            inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1}, {a:1,b:2,c:3})).
                toBeEquivObjRelativeDiffs({relDiff:{a:0}, added:{b:2,c:3}, deleted:{}});
          }));
          it('should indicate keys in left object but not in right',
            inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:2,c:3}, {a:1})).
                toBeEquivObjRelativeDiffs({relDiff:{a:0}, added:{}, deleted:{b:2,c:3}});
          }));
          it('should return relative difference for elements at shared keys',
            inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:1,c:1}, {a:1.1,b:1.2,c:1.3})).
                toBeEquivObjRelativeDiffs({relDiff:{a:0.1,b:0.2,c:0.3}, added:{}, deleted:{}});
          }));
          it('should return Infinity for relative difference from 0',
            inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:0, b:0}, {a:10, b:-10})).
                toBeEquivObjRelativeDiffs({
                    relDiff:{a:Infinity, b:-Infinity}, added:{}, deleted:{}});
          }));
          it('should return zeroes for nested identical objects', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:{d:4,e:5},c:3}, {a:1,b:{d:4,e:5},c:3})).
                toBeEquivObjRelativeDiffs({
                    relDiff:{a:0,b:{relDiff: {d:0,e:0}, added: {}, deleted: {}},c:0},
                    added:{},
                    deleted:{}
                });
          }));
          it('should return relative diffs for nested objects', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:{d:4,e:5},c:3}, {a:1,b:{d:8,e:15},c:3})).
                toBeEquivObjRelativeDiffs({
                    relDiff:{a:0,b:{relDiff: {d:1,e:2}, added: {}, deleted: {}},c:0},
                    added:{},
                    deleted:{}
                });
          }));
          it('should report added or deleted keys in nested objects', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:{d:4,e:5},c:3}, {a:1,b:{d:4,f:6},c:3})).
                toBeEquivObjRelativeDiffs({
                    relDiff:{a:0,b:{relDiff: {d:0}, added: {f:6}, deleted: {e:5}},c:0},
                    added:{},
                    deleted:{}
                });
          }));
          it('should report added or deleted nested objects', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:{d:4,e:5},c:3}, {a:1,c:3,f:{g:7}})).
                toBeEquivObjRelativeDiffs({
                    relDiff:{a:0,c:0},
                    added:{f:{g:7}},
                    deleted:{b:{d:4,e:5}}
                });
          }));
          it('should return zeroes for nested identical arrays', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:[4,5],c:3}, {a:1,b:[4,5],c:3})).
                toBeEquivObjRelativeDiffs({
                    relDiff:{a:0,b:{relDiff: [0,0], added: [], deleted: []},c:0},
                    added:{},
                    deleted:{}
                });
          }));

          // Sample of what conifer mutation statistics would look like:
          it('should produce a report of conifer mutation statistics', inject(function(ConiferLib) {
              var parentData, childData;
              
              parentData = {
                  "treeParams": {
                      "age": 2,
                      "needles": false,
                      "udTrunkLengthIncrementPerYear": 1.4,
                      "udTrunkBranchLengthRatio": 0.65,
                      "udTrunkBranchAngles": [ 0.698, 0.898, 1.31, 0.967 ],
                      "udTrunkGirth": 5.0,
                      "udWhorlsPerYear": 4,
                      "udWhorlSize": 5,
                      "udBranchGirth": 1.0,
                      "udBranchBranchLengthRatio": 1.0,
                      "udBranchBranchLengthRatio2": 1.0
                  },
                  "imageUrl": "img/specimen00.svg",
                  "dirty": false
              };

              childData = {
                  "treeParams": {
                      "age": 2,
                      "needles": false,
                      "udTrunkLengthIncrementPerYear": 1.45,
                      "udTrunkBranchLengthRatio": 0.65,
                      "udTrunkBranchAngles": [ 0.698, 0.898, 1.0, 0.967 ],
                      "udTrunkGirth": 5.0,
                      "udWhorlsPerYear": 6,
                      "udWhorlSize": 5,
                      "udBranchGirth": 1.0,
                      "udBranchBranchLengthRatio": 1.0,
                      "udBranchBranchLengthRatio2": 1.0
                  },
                  "imageUrl": "img/specimen01.svg",
                  "dirty": false
              };

              // Notice:
              //    * No analysis of imageUrl or dirtyBit
              //    * No analysis of needles
              //    * 3 levels of analysis: individual, treeParams, udTrunkBranchAngles
              expect(ConiferLib.objRelativeDiff(parentData, childData)).
                  toBeEquivObjRelativeDiffs({
                        relDiff: {
                            treeParams: {
                                relDiff: {
                                    age: 0,
                                    udTrunkLengthIncrementPerYear: 0.035714,
                                    udTrunkBranchLengthRatio: 0,
                                    udTrunkBranchAngles: {
                                        relDiff: { 0: 0, 1: 0, 2: -0.236641, 3: 0 },
                                        added: {},
                                        deleted: {}
                                    },
                                    udTrunkGirth: 0,
                                    udWhorlsPerYear: 0.5,
                                    udWhorlSize: 0,
                                    udBranchGirth: 0,
                                    udBranchBranchLengthRatio: 0,
                                    udBranchBranchLengthRatio2: 0
                                },
                                added: {},
                                deleted: {}
                            }
                        },
                        added: {},
                        deleted: {}
                  });
          }));
      });
      
      describe('mergeObjectProperties', function() {
          it('should return empty for empty list', inject(function(ConiferLib) {
              var input, expected;
              input = [];
              expected = {};
              expect(ConiferLib.mergeObjectProperties(input)).toEqual(expected);
          }));
          it('should not change a single singleton object', inject(function(ConiferLib) {
              var input, expected;
              input = [{a: 5}];
              expected = {a: 5};
              expect(ConiferLib.mergeObjectProperties(input)).toEqual(expected);
          }));
          it('should merge disjoint objects', inject(function(ConiferLib) {
              var input, expected;
              input = [{a: 5}, {b: 6}, {c: 7}];
              expected = {a: 5, b: 6, c: 7};
              expect(ConiferLib.mergeObjectProperties(input)).toEqual(expected);
          }));
          it('should merge non-disjoint objects', inject(function(ConiferLib) {
              var input, expected;
              input = [{a: 5}, {b: 6}, {a: 3, c: 7}];
              expected = {a: 3, b: 6, c: 7};
              expect(ConiferLib.mergeObjectProperties(input)).toEqual(expected);
          }));
          it('should preserve nested objects', inject(function(ConiferLib) {
              var input, expected;
              input = [{a: 5}, {b: {d: 6}}, {a: 3, c: 7}];
              expected = {a: 3, b: {d: 6}, c: 7};
              expect(ConiferLib.mergeObjectProperties(input)).toEqual(expected);
          }));
      });

      describe('escapeNestedObjKey', function() {
          it('should not change key without dot', inject(function(ConiferLib) {
              expect(ConiferLib.escapeNestedObjKey('a')).toEqual('a');
          }));
          it('should escape a single dot', inject(function(ConiferLib) {
              expect(ConiferLib.escapeNestedObjKey('a.b')).toEqual('a\\.b');
          }));
          it('should escape multiple dots', inject(function(ConiferLib) {
              expect(ConiferLib.escapeNestedObjKey('a.b.c.d')).toEqual('a\\.b\\.c\\.d');
          }));
      });

      describe('denormalizeObjRelativeDiff', function() {
          it('should return empty for empty object', inject(function(ConiferLib) {
              var input, expected;
              input = {relDiff: {}, added: {}, deleted: {}};
              expected = input;
              expect(ConiferLib.denormalizeObjRelativeDiff(input)).
                  toEqual({relDiff: {}, added: {}, deleted: {}});
          }));
          it('should not change single-level object', inject(function(ConiferLib) {
              var input, expected;
              input = {relDiff: {a:0, b:1, c:2}, added: {d: 3, e: 4}, deleted: {f: 5}};
              expected = {relDiff: [{a:0}, {b:1}, {c:2}], added: [{d: 3}, {e: 4}], deleted: [{f: 5}]};
              expect(ConiferLib.denormalizeObjRelativeDiff(input)).toEqual(expected);
          }));
          it('should merge relDiff keys of nested objects', inject(function(ConiferLib) {
              var input, expected;
              input = {
                  relDiff: {
                      a:0,
                      b:1,
                      c: {
                          relDiff: {g: 2},
                          added: {},
                          deleted: {}
                      }
                  },
                  added: {d: 3, e: 4},
                  deleted: {f: 5}
              };
              expected = {
                  relDiff: [
                      {a: 0},
                      {b: 1},
                      {'c.g': 2}
                  ],
                  added: [{d: 3}, {e: 4}],
                  deleted: [{f: 5}]
              };
              expect(ConiferLib.denormalizeObjRelativeDiff(input)).toEqual(expected);
          }));
          it('should merge added keys of nested objects', inject(function(ConiferLib) {
              var input, expected;
              input = {
                  relDiff: {
                      a:0,
                      b:1,
                      c: {
                          relDiff: {g: 2},
                          added: {x: "foo", y: "bar"},
                          deleted: {}
                      }
                  },
                  added: {d: 3, e: 4},
                  deleted: {f: 5}
              };
              expected = {
                  relDiff: [
                      {a:0},
                      {b:1},
                      {'c.g': 2}
                  ],
                  added: [{'c.x': "foo"}, {'c.y': "bar"}, {d: 3}, {e: 4}],
                  deleted: [{f: 5}]
              };
              expect(ConiferLib.denormalizeObjRelativeDiff(input)).toEqual(expected);
          }));
          it('should merge deleted keys of nested objects', inject(function(ConiferLib) {
              var input, expected;
              input = {
                  relDiff: {
                      a:0,
                      b:1,
                      c: {
                          relDiff: {g: 2},
                          added: {x: "foo", y: "bar"},
                          deleted: {z: "zot"}
                      }
                  },
                  added: {d: 3, e: 4},
                  deleted: {f: 5}
              };
              expected = {
                  relDiff: [
                      {a:0},
                      {b:1},
                      {'c.g': 2}
                  ],
                  added: [{'c.x': "foo"}, {'c.y': "bar"}, {d: 3}, {e: 4}],
                  deleted: [{'c.z': "zot"}, {f: 5}]
              };
              expect(ConiferLib.denormalizeObjRelativeDiff(input)).toEqual(expected);
          }));
      });
      
      describe('objToArrayOfSingletons', function() {
          it('should return empty for empty object', inject(function(ConiferLib) {
              expect(ConiferLib.objToArrayOfSingletons({})).toEqual([]);
          }));
          it('should return singletons for object properties', inject(function(ConiferLib) {
              expect(ConiferLib.objToArrayOfSingletons({a: 0, b: "x", c: false})).
                  toEqual([{a: 0}, {b: "x"}, {c: false}]);
          }));
          it('should recurse into nested objects', inject(function(ConiferLib) {
              expect(ConiferLib.objToArrayOfSingletons({a: 0, b: {d: "x", e: 1}, c: false})).
                  toEqual([{a: 0}, {b: [{d: "x"}, {e: 1}]}, {c: false}]);
          }));
          it('should recurse into nested objects (again)', inject(function(ConiferLib) {
              var input, expected;
              input = {d: {a: 0, b: 2, c: 1}};
              expected = [{d: [{a: 0}, {b: 2}, {c: 1}]}];
              expect(ConiferLib.objToArrayOfSingletons(input)).toEqual(expected);
          }));
      });
      
      describe('sortSingletonObjectArrayDesc', function() {
          it('should return empty for empty object', inject(function(ConiferLib) {
              expect(ConiferLib.sortSingletonObjectArrayDesc([])).toEqual([]);
          }));
          it('should sort array of non-nested singletons', inject(function(ConiferLib) {
              var input, expected;
              input =    [{a: 0}, {b: 2}, {c: 1}];
              expected = [{b: 2}, {c: 1}, {a: 0}];
              expect(ConiferLib.sortSingletonObjectArrayDesc(input)).toEqual(expected);
          }));
          it('should recurse into nested objects', inject(function(ConiferLib) {
              var input, expected;
              input =    [{d: [{a: 0}, {b: 2}, {c: 1}]}];
              expected = [{d: [{b: 2}, {c: 1}, {a: 0}]}];
              expect(ConiferLib.sortSingletonObjectArrayDesc(input)).toEqual(expected);
          }));
      });
      
      describe('valueOfSingletonObj', function() {
          it('should return value of single object property', inject(function(ConiferLib) {
              expect(ConiferLib.valueOfSingletonObj({a: 123})).toEqual(123);
          }));
          it('should return first value of array of singletons', inject(function(ConiferLib) {
              expect(ConiferLib.valueOfSingletonObj({c: [{a: 456}, {b: 789}]})).toEqual(456);
          }));
      });
      
      describe('sortObjRelativeDiffDesc', function() {
          it('should return empty for empty objects', inject(function(ConiferLib) {
              var input, expected;
              
              input = {relDiff:{}, added:{}, deleted:{}};
              expected = {relDiff:[], added:[], deleted:[]};
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should convert singleton diff to array', inject(function(ConiferLib) {
              var input, expected;
              
              input = {relDiff:{a:0}, added:{}, deleted:{}};
              expected = {relDiff:[{a:0}], added:[], deleted:[]};
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should sort numbers in descending order within single-level diff',
                  inject(function(ConiferLib) {
              var input, expected;
              
              input = {relDiff:{a:0, b:2, c:1}, added:{}, deleted:{}};
              expected = {relDiff:[{b:2}, {c:1}, {a:0}], added:[], deleted:[]};
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should sort numbers in single-level diff descending by absolute value',
                  inject(function(ConiferLib) {
              var input, expected;
              
              input = {relDiff:{a:0, b:-2, c:1}, added:{}, deleted:{}};
              expected = {relDiff:[{b:-2}, {c:1}, {a:0}], added:[], deleted:[]};
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should sort numbers in descending order within single-level added',
                  inject(function(ConiferLib) {
              var input, expected;
              
              input = {relDiff:{}, added:{a:0, b:2, c:1}, deleted:{}};
              expected = {relDiff:[], added:[{b:2}, {c:1}, {a:0}], deleted:[]};
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should sort numbers in descending order within single-level deleted',
                  inject(function(ConiferLib) {
              var input, expected;
              
              input = {relDiff:{}, added:{}, deleted:{a:0, b:2, c:1}};
              expected = {relDiff:[], added:[], deleted:[{b:2}, {c:1}, {a:0}]};
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should sort fields of nested diffs', inject(function(ConiferLib) {
              var input, expected;

              input = {
                  relDiff:{
                      d: {
                          relDiff: {a:0, b:2, c:1},
                          added: {},
                          deleted: {}
                      }
                  },
                  added: {},
                  deleted: {}
              };
              expected = {
                  relDiff: [{'d.b':2}, {'d.c':1}, {'d.a':0}],
                  added: [],
                  deleted: []
              };
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should sort nested diffs against outer diff according to highest value',
                  inject(function(ConiferLib) {
              var input, expected;

              input = {
                  relDiff:{
                      d: {
                          relDiff: {a:0, b:2, c:1},
                          added: {},
                          deleted: {}
                      },
                      e: 3
                  },
                  added: {},
                  deleted: {}
              };
              expected = {
                  relDiff:[{e: 3}, {'d.b':2}, {'d.c':1}, {'d.a':0}],
                  added: [],
                  deleted: []
              };
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should sort nested adds against outer',
                  inject(function(ConiferLib) {
              var input, expected;

              input = {
                  relDiff:{
                      d: {
                          relDiff: {a:0, b:2, c:1},
                          added: {j: {p: 9, q: 10.5}},
                          deleted: {}
                      },
                      e: 3
                  },
                  added: {f: 10, g: 11},
                  deleted: {}
              };
              expected = {
                  relDiff:[{e: 3}, {'d.b':2}, {'d.c':1}, {'d.a':0}],
                  added: [{g: 11}, {'d.j.q': 10.5}, {f: 10}, {'d.j.p': 9}],
                  deleted: []
              };
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
          it('should sort nested adds and deletes against outer',
                  inject(function(ConiferLib) {
              var input, expected;

              input = {
                  relDiff:{
                      d: {
                          relDiff: {a:0, b:2, c:1},
                          added: {j: {p: 9, q: 10.5}},
                          deleted: {k: {x: 11, y: 12.5, z: 14}}
                      },
                      e: 3
                  },
                  added: {f: 10, g: 11},
                  deleted: {h: 13, i: 12}
              };
              expected = {
                  relDiff:[{e: 3}, {'d.b':2}, {'d.c':1}, {'d.a':0}],
                  added: [{g: 11}, {'d.j.q': 10.5}, {f: 10}, {'d.j.p': 9}],
                  deleted: [{'d.k.z': 14}, {h: 13}, {'d.k.y': 12.5}, {i: 12}, {'d.k.x': 11}]
              };
              
              expect(ConiferLib.sortObjRelativeDiffDesc(input)).
                  toBeEquivObjRelativeDiffs(expected);
          }));
      });
  });
});
