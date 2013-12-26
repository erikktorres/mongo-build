var except = require('./except.js');

exports.notNull = function(val, message) 
{
  if (val == null) {
    var restOfArgs = Array.prototype.slice.call(arguments, 2);
    throw except.IAE.apply(null, [message].concat(restOfArgs));
  }
  return val;
}