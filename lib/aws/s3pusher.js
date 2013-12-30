var path = require('path');
var util = require('util');

var moment = require('moment');

var pre = require('../common/pre.js');
var log = require('../log.js')('s3pusher.js');

module.exports = function(s3, pusherConfig, timer, fs) {
  if (timer == null) {
    timer = function(){ return moment().utc(); };
  }
  if (fs == null) {
    fs = require('fs');
  }

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
      var dateString = timer().format('[y]=YYYY/[m]=MM/[d]=DD/[H]=HH/[M]=mm/');
      var key = util.format('%s%s%s', keyPrefix, dateString, path.basename(file));

      log.info('Pushing file[%s] to [s3://%s/%s]', file, bucket, key);
      s3.putObject(
        {
          Bucket: bucket,
          Key: key,
          Body: fs.createReadStream(file),
          ACL: "private",
          ServerSideEncryption: 'AES256'
        },
        cb
      );
    }
  }
}