var path = require('path');
var util = require('util');

var moment = require('moment');

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
      var dateString = moment().utc().format('[y]=YYYY/[m]=MM/[d]=DD/[h]=HH/[m]=mm/');
      var key = util.format('%s%s%s', keyPrefix, dateString, path.basename(file));

      log.info('Pushing file[%s] to [s3://%s/%s]', bucket, key);
      s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: file,
        ACL: "private",
        ServerSideEncryption: 'AES256'
      },
      cb
    );
    }
  }
}