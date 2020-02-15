'use strict';

/* Controllers */

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this && this[from] === elt)
        return from;
    }
    return -1;
  };
}

function applyChangesOnScope(scope, func) {
  if (!scope.$$phase) {
    scope.$apply(function () { // need digest
      func();
    });
  }
  else {
    func();
  }
}

angular.module('app.controllers', ['theme.core.directives']);
