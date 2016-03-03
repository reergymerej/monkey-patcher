#!/usr/bin/env node

'use strict';

var assert = require('assert');

// use IIFE for privacy
var app = (function () {
  var count = 0;

  return {
    increment: function () {
      return ++count; // Sorry, Crockford. :(
    },  // dangling commas FTW!
  };
}());

/**
* a revertable monkey-patcher
* @param {Object} scope
* @param {String} member
* @param {Function} patch
*/
var monkeyPatch = function (scope, member, patch) {
  var original = scope[member];
  scope[member] = patch;

  // Functions are regular objects, so tack the revert
  // right into the patch so we don't have to keep
  // any other references.
  scope[member].revert = function () {

    // use closure for original
    scope[member] = original;
  };

  scope[member].revertAll = function () {

    // use hasOwnProperty because we're diligent
    while(scope[member].hasOwnProperty('revert')) {
      scope[member].revert();
    }
  };
};

var patch1 = function () { return 'patch #1'; };
var patch2 = function () { return 'patch #2'; };
var patch3 = function () { return 'patch #3'; };

// sanity check
assert(app.increment() === 1);
assert(app.increment() === 2);

// patch it and verify that the original code is not called
monkeyPatch(app, 'increment', patch1);
assert(app.increment === patch1);
console.log(app.increment());

// patch it again
monkeyPatch(app, 'increment', patch2);
assert(app.increment === patch2);
console.log(app.increment());

// undo that last patch and confirm we're back to patch1
app.increment.revert();
assert(app.increment === patch1);
console.log(app.increment());

// apply a different patch
monkeyPatch(app, 'increment', patch3);
assert(app.increment === patch3);
console.log(app.increment());

// undo all of the patches and verify
app.increment.revertAll();
assert(app.increment() === 3);
