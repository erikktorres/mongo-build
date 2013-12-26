var path = require('path');

var async = require('async');
var moment = require('moment');

var log = require('./log.js')('mongoBackup.js');
var pre = require('./common/pre.js');

module.exports = function(mongoClient, pusher, fileUtils, polling, config){
  pre.notNull(config.storage(), "Config.storage() cannot return null.");

  var dumpCleanup = function() {
    log.info("Cleaning up...");
  }

  var shouldDoBackup = function (cb) {
    if (config.replSet()) {
      log.info("Backing up a replication set. Checking to see if I'm the one who should do it.");
      mongoClient.connect(function(err, db) {
        if (err != null) {
          return cb(err);
        }
        cb(null, true);
      });
    }
    else {
      cb(null, true);
    }
  }

  var maybeDo = function(testFn, yesCb, noCb) {
    testFn(function(err, result){
      if (err != null) {
        return noCb(err);
      }
      else if (result) {
        yesCb();
      }
      else {
        noCb();
      }
    });
  }

  return {
    start: function() {
        polling.repeat(
          'mongo-backup',
          function(cb){
            log.info("Starting backup of mongo.");

            var storageDir = config.storage();
            var tarFile = path.join(storageDir, 'mongo-backup.tar.gz');

            maybeDo(
              shouldDoBackup,
              async.series.bind(async, 
                [
                  mongoClient.dump.bind(mongoClient, config.mongodumpCmdArgs(), storageDir),
                  fileUtils.buildTar.bind(null, storageDir, tarFile),
                  pusher.push.bind(pusher, tarFile)
                ],
                function (err) {
                  if (err != null) {
                    log.error(err, "Error running backup");
                  }
                  fileUtils.deleteDir(storageDir);
                }
              ),
              cb
            );

          },
          function() {
            var period = config.period();
            var next = moment().startOf(period).add(period, 1);
            log.info("Scheduling next backup at [%s]", next);
            return next.valueOf() - moment().valueOf();
          }
        );

    }
  }
}