var AWS = require('aws-sdk');
var _ = require('lodash');

var log = require('../log.js')('init/s3.js');
var pre = require('../common/pre.js');

var configFns = {
  metadata: function(config) {
    log.info('Creating s3 client using metadata and config[%j]', config);
    var retVal = _.cloneDeep(config.config || {});
    retVal.credentialProvider = new AWS.CredentialProviderChain([
      new AWS.EC2MetadataCredentials()
    ]);
    return retVal;
  },
  file: function(config) {
    log.info('Creating s3 client using file from config[%j]', config);
    var retVal = _.cloneDeep(config.config || {});
    retVal.credentialProvider = new AWS.CredentialProviderChain([
      new AWS.EC2MetadataCredentials('config.file')
    ]);
    return retVal;
  },
  static: function(config) {
    return config.config;
  }
}

module.exports = function(config) {
  pre.notNull(config.type, "s3 type must not be null");

  var configFn = configFns[config.type];
  pre.notNull(configFn, "Unknown config.type[%s], known options[%s]", config.type, Object.keys(configFns));

  return new AWS.S3(configFn(config));
}