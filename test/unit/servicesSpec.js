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
               return ConiferLib.equivArrays(this.actual.diff, expected.diff) &&
                      ConiferLib.equivArrays(this.actual.added, expected.added) &&
                      ConiferLib.equivArrays(this.actual.deleted, expected.deleted);
             },
             toBeEquivObjRelativeDiffs: function(expected) {
               return ConiferLib.equivObjects(this.actual, expected);
             }
          });
      }));
      
      describe('isArray', function() {
          it('should return true for empty array', inject(function(ConiferLib) {
              expect(ConiferLib.isArray([])).toEqual(true);
          }));
          it('should return false for empty object', inject(function(ConiferLib) {
              expect(ConiferLib.isArray({})).toEqual(false);
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
          it('should return all elements in given one array of unique elements',
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
                toBeEquivRelativeDiffs({diff:[], added:[], deleted:[]});
          }));
          it('should return zeroes for identical arrays', inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,2,3], [1,2,3])).
                toBeEquivRelativeDiffs({diff:[0,0,0], added:[], deleted:[]});
          }));
          it('should indicate elements in right array beyond length of left array',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1], [1,2,3])).
                toBeEquivRelativeDiffs({diff:[0], added:[2,3], deleted:[]});
          }));
          it('should indicate elements in left array beyond length of right array',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,2,3], [1])).
                toBeEquivRelativeDiffs({diff:[0], added:[], deleted:[2,3]});
          }));
          it('should return relative difference for elements at shared indices',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,1,1], [1.1,1.2,1.3])).
                toBeEquivRelativeDiffs({diff:[0.1,0.2,0.3], added:[], deleted:[]});
          }));
          it('should return Infinity for relative difference from 0',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([0, 0], [10, -10])).
                toBeEquivRelativeDiffs({diff:[Infinity, -Infinity], added:[], deleted:[]});
          }));
      });

      describe('objRelativeDiff', function() {
          it('should return empty for empty objects', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({},{})).
                toBeEquivObjRelativeDiffs({diff:{}, added:{}, deleted:{}});
          }));
          it('should return zeroes for identical objects', inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:2,c:3}, {a:1,b:2,c:3})).
                toBeEquivObjRelativeDiffs({diff:{a:0,b:0,c:0}, added:{}, deleted:{}});
          }));
          it('should indicate keys in right object but not in left',
            inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1}, {a:1,b:2,c:3})).
                toBeEquivObjRelativeDiffs({diff:{a:0}, added:{b:2,c:3}, deleted:{}});
          }));
          it('should indicate keys in left object but not in right',
            inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:2,c:3}, {a:1})).
                toBeEquivObjRelativeDiffs({diff:{a:0}, added:{}, deleted:{b:2,c:3}});
          }));
          it('should return relative difference for elements at shared keys',
            inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:1,b:1,c:1}, {a:1.1,b:1.2,c:1.3})).
                toBeEquivObjRelativeDiffs({diff:{a:0.1,b:0.2,c:0.3}, added:{}, deleted:{}});
          }));
          it('should return Infinity for relative difference from 0',
            inject(function(ConiferLib) {
              expect(ConiferLib.objRelativeDiff({a:0, b:0}, {a:10, b:-10})).
                toBeEquivObjRelativeDiffs({diff:{a:Infinity, b:-Infinity}, added:{}, deleted:{}});
          }));
      });
  });
});
