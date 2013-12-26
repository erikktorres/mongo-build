exports.sinon= require('sinon');

var sinonChai = require('sinon-chai');
var chai = require('chai');

chai.use(sinonChai);

exports.expect = chai.expect;
exports.mockableObject = require('./mockableObject.js');

var fn = require('../lib/common/fn.js');
exports.makeConfig = function(obj) {
  var retVal = {};
  for (var field in obj) {
    retVal[field] = fn.returns(obj[field]);
  }
  return retVal;
}