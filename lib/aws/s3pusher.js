var path = require('path');
var util = require('util');

var pre = require('../common/pre.js');
var log = require('../log.js')('s3pusher.js');

module.exports = function(s3, pusherConfig) {
  var bucket = pre.notNull(pusherConfig.bucket, "Must specify a bucket for the s3 pusher.");
  var keyPrefix = pre.notNull(pusherConfig.keyPrefix, "Must specify a key prefix for the s3 pusher.");

  while (keyPrefix.charAt(0) === '/') {
    keyPrefix = keyPrefix.substring(1, keyPrefix.length);
  }

  while (keyPrefix.charAt(keyPrefix.length - 1) === '/') {
    keyPrefix = keyPrefix.substring(0, keyPrefix.length - 1);
  }

  if (keyPrefix.length > 0) {
    keyPrefix = keyPrefix + '/';
  }

  log.info('Building s3Pusher with bucket[%s], keyPrefix[%s]', bucket, keyPrefix);

  return {
    push: function(file, cb) {
      s3.putObject({
        Bucket: bucket,
        Key: util.format('%s%s', keyPrefix, path.basename(file)),
        Body: file,
        ACL: "private",
        ServerSideEncryption: 'AES256'
      },
      cb
    );
    }
  }
}