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
             }
             , toBeEquivArrays: function(expected) {
               return ConiferLib.equivArrays(this.actual, expected);
             }
          });
      }));
      
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

      // Describes some inconsistent math. By convention, I'm returning +/- 1.0 for
      // added or deleted elements, respectively, and +1.0 for elements changed from 0.
      describe('arrayRelativeDiff', function() {
          it('should return empty for empty arrays', inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([],[])).toEqual([]);
          }));
          it('should return zeroes for identical arrays', inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,2,3], [1,2,3])).toBeEquivArrays([0,0,0]);
          }));
          it('should return 1 for elements in right array beyond length of left array',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1], [1,2,3])).toBeEquivArrays([0,1,1]);
          }));
          it('should return -1 for elements in left array beyond length of right array',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,2,3], [1])).toBeEquivArrays([0,-1,-1]);
          }));
          it('should return relative difference for elements at shared indices',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([1,1,1], [1.1,1.2,1.3])).
                toBeEquivArrays([0.1,0.2,0.3]);
          }));
          it('should return 1 for relative difference from 0',
            inject(function(ConiferLib) {
              expect(ConiferLib.arrayRelativeDiff([0, 0], [10, -10])).toBeEquivArrays([1, 1]);
          }));
      });
  });
});
