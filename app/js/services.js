'use strict';

// Services

var appServices = angular.module('myApp.services', ['ngResource']);

appServices.value('version', '0.1');

appServices.factory('Population',
    function () {
        var data, default_individual_data,
            insertFunc, queryIDFunc, copySpecData, copyTreeParams,
            copyArray, mutateFunc;

        data = {
            rows: []
        };

        // Hardcode an initial population of one.
        default_individual_data = [
            {
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
            }
        ];

        insertFunc = function (individualData) {
            var i;
            i = data.rows.length;
            data.rows.push({id: i, data: individualData});
            return i;
        };

        queryIDFunc = function (id) {
            var match;
            data.rows.forEach(function (item) {
                if (item.id == id) { // need the coercion
                    match = item;
                }
            });
            return match;
        };

        copySpecData = function (specData) {
            var newSpecData;
            newSpecData = {};
            newSpecData.treeParams = copyTreeParams(specData.treeParams);
            newSpecData.imageUrl = "";
            newSpecData.dirty = true;
            return newSpecData;
        };

        copyTreeParams = function (tp) {
            var newTP;
            newTP = {};
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
        copyArray = function (arr) {
            var newArr, i;
            newArr = [];
            for (i = 0; i < arr.length; ++i) {
                newArr[i] = arr[i];
            }
            return newArr;
        };

        // Mutates in-place.
        mutateFunc = function (specData) {
            var pct, key, index,
                randomProperty, randomPercent;

            randomProperty = function (obj) {
                var keys;
                keys = Object.keys(obj);
                return keys[keys.length * Math.random() << 0];
            };

            randomPercent = function (amplitude) {
                return 1 + (Math.random() * 2 * amplitude - amplitude);
            };

            key = randomProperty(specData.treeParams);
            if (key === "udTrunkBranchAngles") {
                index = Math.floor(Math.random() *
                    specData.treeParams.udTrunkBranchAngles.length);
                pct = randomPercent(0.2);
                specData.treeParams.udTrunkBranchAngles[index] *= pct;
                specData.dirty = true;
            } else if (key !== "age" && key !== "needles") {
                // specData.treeParams.udTrunkLengthIncrementPerYear *= 1.1;
                pct = randomPercent(0.2);
                specData.treeParams[key] *= pct;
                specData.dirty = true;
            }
        };

        default_individual_data.forEach(function (individualData) {
            insertFunc(individualData);
        });

        return {
            init: function () {
                data = {rows: []};
            },
            insertInto: insertFunc,
            queryID: queryIDFunc,
            queryIDs: function (ids) {
                var result;
                result = [];
                ids.forEach(function (id) {
                    var spec;
                    spec = queryIDFunc(id);
                    if (spec !== undefined) {
                        result.push(spec);
                    }
                });
                return result;
            },
            reproduce: function (parentID) {
                var parentSpec, newSpecData;
                parentSpec = queryIDFunc(parentID);
                newSpecData = copySpecData(parentSpec.data);
                mutateFunc(newSpecData);
                return insertFunc(newSpecData);
            },
            copyIndividual: copySpecData
        };
    });

appServices.factory('CurrentPopulation',
    function () {
        var populationIDs;
        populationIDs = [];

        return {
            init: function () {
                populationIDs = [];
            },
            push: function (id) {
                populationIDs.push(id);
            },
            query: function () {
                return populationIDs;
            }
        };
    });


appServices.factory('Lineage', [ 'Population',
    function (Population) {
        var data;
        data = { rows: [] };

        return {
            init: function () {
                data = { rows: [] };
            },
            insertInto: function (individualID) {
                var individual, linID, linObj;

                individual = Population.queryID(individualID);
                linID = data.rows.length;
                linObj = {id: linID, data: individualID, individual: individual};

                data.rows.push(linObj);

                return linID;
            },
            queryID: function (id) {
                var match;
                data.rows.forEach(function (item) {
                    if (item.id == id) {
                        match = item;
                    }
                });
                return match;
            },
            queryLast: function () {
                if (data.rows.length > 0) {
                    return data.rows[data.rows.length - 1];
                }
            },
            query: function () {
                return data.rows; // Returning alias!
            }
        };
    }]);

appServices.factory('Image', [ '$http', 'Population',
    function ($http, Population) {

        return {
            get: function (individualData) {
                var getImage, setImage;

                setImage = function (specData, data) {
                    specData.imageUrl = "img/" + data;
                };

                getImage = function (tp, ok) {
                    $http({ method : 'POST',
                            url : 'conifer/draw',
                            data : 'userdata=' + angular.toJson(tp),
                            headers: {'Content-Type':
                                'application/x-www-form-urlencoded'}
                        }).success(ok);
                };

                getImage(individualData.treeParams,
                    function (data) {
                        setImage(individualData, data);
                    });
            },
            getByID: function (id) {
                var individual, individualData, getImage, setImage;

                setImage = function (specData, data) {
                    specData.imageUrl = "img/" + data;
                };

                getImage = function (tp, ok) {
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
                    function (data) {
                        setImage(individualData, data);
                    });
            }
        };
    }]);

appServices.factory('ConiferLib',
    function () {
        var isArray, isEmptyObject, objToArrayOfSingletons, valueOfSingletonObj,
            sortSingletonObjectArrayDesc, denormalizeObjRelativeDiff, mergeObjectProperties,
            eps, epsilon, setEpsilon, immValueOfSingletonObj,
            equivZeroWithin, equivZero, equiv, equivArrays, equivObjects,
            objRelativeDiff, arrayRelativeDiff, sortObjRelativeDiffDesc,
            arrayUnion, arrayIndex, arrayContains,
            randomKey, randomKeyExcept, randomNormalDist;

        // From Crockford. Works for arrays defined within window or frame.
        // Note: I removed the initial test of a, which allowed checking simple types.
        isArray = function (a) {
            return typeof a === 'object' && a.constructor === Array;
        };

        isEmptyObject = function (obj) {
            var prop;
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        };

        // Return an array of singleton objects, one for each
        // non-inherited property of the input. Recurses into
        // nested objects.
        objToArrayOfSingletons = function (obj) {
            var result, key, obj2;
            result = [];
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    obj2 = {};
                    if (typeof obj[key] === 'object') {
                        obj2[key] = objToArrayOfSingletons(obj[key]);
                    } else {
                        obj2[key] = obj[key];
                    }
                    result.push(obj2);
                }
            }
            return result;
        };

        // Extract the value of the key of a singleton object,
        // recursing into nested objects and arrays.
        valueOfSingletonObj = function (obj) {
            var key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (isArray(obj[key])) {
                        return valueOfSingletonObj(obj[key][0]);
                    } else {
                        return obj[key];
                    }
                }
            }
        };

        // Extract the value of the key of a singleton object
        // without recursion.
        immValueOfSingletonObj = function (obj) {
            var key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return obj[key];
                }
            }
        };

        // Sort the input in descending order by the value of the singleton 
        // object elements. Sorts in-place by bubblesort.
        // Nested objects are sorted, and placed within the outer object
        // according to the highest value contained.
        sortSingletonObjectArrayDesc = function (arr) {
            var i, j, temp, vali, valj;

            // Pass simple value back as sorted.
            if (!isArray(arr) && typeof arr !== 'object') {
                return arr;
            }

            // Pass over all properties and sort nested objects.
            for (i = 0; i < arr.length; ++i) {
                if (isArray(arr[i])) {
                    sortSingletonObjectArrayDesc(arr[i]);
                } else if (typeof arr[i] === 'object') {
                    vali = immValueOfSingletonObj(arr[i]);
                    sortSingletonObjectArrayDesc(vali);
                }
            }

            // Bubblesort the array, treating nested objects as
            // simple values as reported by valueOfSingletonObj.
            for (i = 0; i < arr.length - 1; ++i) {
                for (j = i + 1; j < arr.length; ++j) {
                    vali = valueOfSingletonObj(arr[i]);
                    valj = valueOfSingletonObj(arr[j]);
                    if (vali < valj) {
                        temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                }
            }
            return arr;
        };

        // The functions in this module that take number arguments, or array,
        // will not validate them. That is the responsibility of the caller.

        eps = 1e-6;

        epsilon = function () {
            return eps;
        };

        setEpsilon = function (e) {
            eps = Math.abs(e);
        };

        equivZeroWithin = function (n, e) {
            return Math.abs(n) <= e;
        };

        equivZero = function (n) {
            return equivZeroWithin(n, eps);
        };

        equiv = function (n1, n2) {
            if (n1 === Infinity && n2 === Infinity) {
                return true;
            }
            if (n1 === -Infinity && n2 === -Infinity) {
                return true;
            }
            if (n1 === Infinity || n1 === -Infinity ||
                n2 === Infinity || n2 === -Infinity) {
                return false;
            }
            return equivZeroWithin(n2 - n1, eps);
        };

        equivArrays = function (a1, a2) {
            var i;
            if (a1.length !== a2.length) {
                return false;
            }
            for (i = 0; i < a1.length; ++i) {
                if (!equiv(a1[i], a2[i])) {
                    return false;
                }
            }
            return true;
        };

        // Numbers are compared with equiv, all else with ===.
        equivObjects = function (a1, a2) {
            var keys1, keys2, i, val1, val2;
            
            // Deal with base cases of recursion.
            if (typeof a1 === 'number') {
                return equiv(a1,a2);
            } else if (typeof a1 !== 'object') {
                return a1 === a2;
            }
            
            // Deep-compare them as objects with numerical equivalence
            // modulo epsilon.
            keys1 = Object.keys(a1);
            keys2 = Object.keys(a2);
            if (keys1.length !== keys2.length) {
                return false;
            }
            for (i = 0; i < keys1.length; ++i) {
                // Check for missing field in a2.
                val1 = a1[keys1[i]];
                val2 = a2[keys1[i]];
                if (val2 === undefined) {
                    return false;
                }
                if (typeof val1 === 'object') {
                    if (!equivObjects(val1, val2)) {
                         return false;
                    }
                } else if (typeof val1 !== 'number') {
                    if (val1 !== val2) {
                        return false;
                    }
                } else if (!equiv(val1, val2)) {
                    return false;
                }
            }
            return true;
        };

        // Shallow comparison of elem with array elements.
        // Returns element index in array, or -1 if element not in array.
        arrayIndex = function (arr, elem) {
            var i;
            for (i = 0; i < arr.length; ++i) {
                if (arr[i] === elem) {
                    return i;
                }
            }
            return -1;
        };

        arrayContains = function (arr, elem) {
            return arrayIndex(arr, elem) !== -1;
        };

        arrayUnion = function (arrs) {
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

        // Analyzes left vs. right and returns relative diff, added, and deleted.
        // If relative diff starting from 0, return +/- Infinity.
        // Both arrays must be defined.
        arrayRelativeDiff = function (left, right) {
            var lenL, lenR, i, min, result;

            result = {relDiff:[], added:[], deleted:[]};

            lenL = left.length;
            lenR = right.length;

            if (lenL === 0 && lenR === 0) {
                return result;
            }

            min = (lenL <= lenR) ? lenL : lenR;
            for (i = 0; i < min; ++i) {
                if (left[i] === right[i]) {
                    result.relDiff.push(0.0);
                } else if (left[i] === 0) {
                    result.relDiff.push(right[i] > 0 ? Infinity : -Infinity);
                } else {
                    result.relDiff.push((right[i] - left[i]) / left[i]);
                }
            }

            if (lenL > lenR) {
                for (i = min; i < lenL; ++i) {
                    result.deleted.push(left[i]);
                }
            } else {
                for (i = min; i < lenR; ++i) {
                    result.added.push(right[i]);
                }
            }

            return result;
        };

        // Analyzes left vs. right and returns relative diff, added, and deleted.
        // If relative diff starting from 0, return +/- Infinity.
        // Both objects must be defined. Only number values are reported.
        objRelativeDiff = function (left, right) {
            var lenL, lenR, i, min, result, key, keysL, keysR;

            result = {relDiff:{}, added:{}, deleted:{}};

            keysL = Object.keys(left);
            keysR = Object.keys(right);

            lenL = keysL.length;
            lenR = keysR.length;

            if (lenL === 0 && lenR === 0) {
                return result;
            }

            // Process all keys from left.
            for (i = 0; i < lenL; ++i) {
                key = keysL[i];
                if (typeof left[key] === 'number') {
                    if (typeof right[key] !== 'number') {
                        result.deleted[key] = left[key];
                    } else if (left[key] === 0) {
                        if (right[key] === 0) {
                            result.relDiff[key] = 0;
                        } else if (right[key] > 0) {
                            result.relDiff[key] = Infinity;
                        } else {
                            result.relDiff[key] = -Infinity;
                        }
                    } else {
                        result.relDiff[key] = (right[key] - left[key]) / left[key];
                    }
                } else if (typeof left[key] === 'object') {
                    if (typeof right[key] !== 'object') {
                        result.deleted[key] = left[key];
                    } else {
                        result.relDiff[key] = objRelativeDiff(left[key], right[key]);
                    }
                }
            }

            // Process all keys from right that aren't in left. All
            // keys in common were handled in the previous loop.
            for (i = 0; i < lenR; ++i) {
                key = keysR[i];
                if (left[key] === undefined) {
                    if (typeof right[key] === 'number' || typeof right[key] === 'object') {
                        result.added[key] = right[key];
                    }
                }
            }
            
            return result;
        };

        // Take union of properties of list of objects. If objects share
        // properties, the last value wins.
        mergeObjectProperties = function (objs) {
            var i, j, obj, keys, result;
            result = {};
            for (i = 0; i < objs.length; ++i) {
                obj = objs[i];
                keys = Object.keys(obj);
                for (j = 0; j < keys.length; ++j) {
                    result[keys[j]] = obj[keys[j]];
                }
            }
            return result;
        };
        
        // Divide a normalized (i.e. original) relative difference object into
        // an object with relDiff, added, and deleted only at the top level, and
        // with properties from the original object under the corresponding keys
        // of the denormalized one.
        denormalizeObjRelativeDiff = function (diff) {
            var i, keys, diff2, added2, deleted2,
                extractDiff, extractTarget;
                
            extractDiff = function (obj) {
                var i, keys, result, result2;
                keys = Object.keys(obj);
                result = {};
                
                // If the keys consist of relDiff, added, and deleted,
                // just pick relDiff and recurse, and throw away the
                // intermediate level of object.
                if (keys.length === 3 && arrayContains(keys, "relDiff") &&
                        arrayContains(keys, "added") && arrayContains(keys, "deleted")) {
                    result = extractDiff(obj.relDiff);
                } else {
                    // Otherwise, take all simple-type properties and
                    // recurse into objects.
                    for (i = 0; i < keys.length; ++i) {
                        if (typeof obj[keys[i]] !== 'object') {
                            result[keys[i]] = obj[keys[i]];
                        } else {
                            result2 = extractDiff(obj[keys[i]]);
                            if (!isEmptyObject(result2)) {
                                result[keys[i]] = result2;
                            }
                        }
                    }
                }
                return result;
            };

            extractTarget = function (obj, target, ignoreSimpleProps) {
                var i, keys, underDiff, underTarget, result, result2;
                keys = Object.keys(obj);
                result = {};

                // If the keys consist of relDiff, added, and deleted,
                // just pick relDiff and recurse, then pick the target and recurse.
                // If the recursion into relDiff produces a non-empty result,
                // store it, otherwise omit it. Always save the result of recursion
                // into the target. Merge the two resultant objects and throw away
                // the intermediate level of object.
                if (keys.length === 3 && arrayContains(keys, "relDiff") &&
                        arrayContains(keys, "added") && arrayContains(keys, "deleted")) {
                    underDiff = extractTarget(obj.relDiff, target, true);
                    underTarget = extractTarget(obj[target], target, false);
                    result = mergeObjectProperties([underDiff, underTarget]);
                } else {
                    // Otherwise, take all simple-type properties and
                    // recurse into objects.
                    for (i = 0; i < keys.length; ++i) {
                        if (typeof obj[keys[i]] !== 'object') {
                            if (!ignoreSimpleProps) {
                                result[keys[i]] = obj[keys[i]];
                            }
                        } else {
                            result2 = extractTarget(obj[keys[i]], target, false);;
                            if (!isEmptyObject(result2)) {
                                result[keys[i]] = result2;
                            }
                        }
                    }
                }
                return result;
            };

            diff2 = extractDiff(diff);
            added2 = extractTarget(diff, 'added', false);
            deleted2 = extractTarget(diff, 'deleted', false);
            return {relDiff: diff2, added: added2, deleted: deleted2};
        };

        sortObjRelativeDiffDesc = function (diff) {
            var result, denormDiff, diff2, added2, deleted2;
            
            result = {relDiff:[], added: [], deleted: []};
            
            if (isEmptyObject(diff.relDiff) && isEmptyObject(diff.added) &&
                    isEmptyObject(diff.deleted)) {
                return result;
            }
            
            denormDiff = denormalizeObjRelativeDiff(diff);
            
            diff2 = objToArrayOfSingletons(denormDiff.relDiff);
            result.relDiff = sortSingletonObjectArrayDesc(diff2);

            added2 = objToArrayOfSingletons(denormDiff.added);
            result.added = sortSingletonObjectArrayDesc(added2);

            deleted2 = objToArrayOfSingletons(denormDiff.deleted);
            result.deleted = sortSingletonObjectArrayDesc(deleted2);
            
            return result;
        };
        
        return {
            'isArray': isArray,
            'isEmptyObject': isEmptyObject,
            'objToArrayOfSingletons': objToArrayOfSingletons,
            'mergeObjectProperties': mergeObjectProperties,
            'immValueOfSingletonObj': immValueOfSingletonObj,
            'valueOfSingletonObj': valueOfSingletonObj,
            'sortSingletonObjectArrayDesc': sortSingletonObjectArrayDesc,
            'epsilon': epsilon,
            'setEpsilon': setEpsilon,
            'equivZeroWithin': equivZeroWithin,
            'equivZero': equivZero,
            'equiv': equiv,
            'equivArrays': equivArrays,
            'equivObjects': equivObjects,
            'arrayIndex': arrayIndex,
            'arrayContains': arrayContains,
            'arrayUnion': arrayUnion,
            'arrayRelativeDiff': arrayRelativeDiff,
            'objRelativeDiff': objRelativeDiff,
            'denormalizeObjRelativeDiff': denormalizeObjRelativeDiff,
            'sortObjRelativeDiffDesc': sortObjRelativeDiffDesc
        };
    });
