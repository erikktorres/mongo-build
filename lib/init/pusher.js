var _ = require('lodash');

var pre = require('../common/pre.js');

var configFns = {
  s3: function(config) {
    var s3 = require('./s3.js')(config.s3);

    return require('../aws/s3pusher.js')(s3, config.pusher);
  }
}

module.exports = function(config) {
  pre.notNull(config.type, "pusher type must not be null");

  var configFn = configFns[config.type];
  pre.notNull(configFn, "Unknown config.type[%s], known options[%s]", config.type, Object.keys(configFns));

  return configFn(config);
}