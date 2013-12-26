var AWS = require('aws-sdk');
var _ = require('lodash');

var pre = require('../common/pre.js');

var configFns = {
  metadata: function(config) {
    var retVal = _.cloneDeep(config.config || {});
    retVal.credentialProvider = new AWS.credentialProviderChain([
      new AWS.EC2MetadataCredentials()
    ]);
    return retVal;
  },
  file: function(config) {
    var retVal = _.cloneDeep(config.config || {});
    retVal.credentialProvider = new AWS.credentialProviderChain([
      new AWS.EC2MetadataCredentials('config.file')
    ]);
    return retVal;
  },
  static: function(config) {
    return config.config;
  }
}

module.exports = function(config) {
  pre.notNull(config.type, "config.type must not be null");

  var configFn = configFns[config.type];
  pre.notNull(configFn, "Unknown config.type[%s], known options[%s]", config.type, Object.keys(configFns));

  return new AWS.S3(configFn(config));
}