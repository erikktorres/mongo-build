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
    // Using time like this has a potential for races, but it *should* generally be ok.
    // In the worst case, a replicated DB might get backed up multiple times.
    var backupId = moment().utc().startOf(config.period()).toISOString();

    mongoClient.connect(function(err, db){
      if (err != null) {
        return cb(err);
      }

      var coll = db.collection('_backups');

      var alreadyThere = function(err, result) {
        log.info("Backup already running[%s]", result);
        db.close();
        cb(err);
      }

      var amITheOne = function(err) {
        if (err != null && err.name === 'MongoError' && err.code === 11000) {
          coll.find({_id: backupId}).toArray(alreadyThere);
        }
        else {
          db.close();
          cb(null, true);
        }
      };

      coll.insert({_id: backupId, who: config.id()}, amITheOne);
    });
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
    start: function(callback) {
        polling.repeatAfterDelay(
          'mongo-backup',
          function(cb){
            log.info("Starting backup of mongo.");

            var storageDir = config.storage();
            var backupDir = path.join(config.storage(), 'mongo-backup');
            var tarFile = path.join(storageDir, 'mongo-backup.tar.gz');

            maybeDo(
              shouldDoBackup,
              async.series.bind(async, 
                [
                  mongoClient.dump.bind(mongoClient, config.mongodumpCmdArgs(), backupDir),
                  fileUtils.buildTar.bind(null, backupDir, tarFile),
                  pusher.push.bind(pusher, tarFile)
                ],
                function (err) {
                  if (err != null) {
                    log.error(err, "Error running backup");
                  }
                  log.info('Deleting storageDir[%s]', storageDir);
                  fileUtils.deleteDir(storageDir);
                  cb();
                }
              ),
              cb
            );

          },
          function() {
            var period = config.period();
            var next = moment().startOf(period).add(period, 1);
            log.info("Scheduling next backup at [%s]", next);
            // Add a few seconds because javascript scheduling is apparently less than wonderful
            return (next.valueOf() - moment().valueOf()) + 10000;
          }
        );
        return callback();
    },
    stop: function(cb) {
      log.info("Stopping the backup, but really just logging, should maybe do more.");
      return cb();
    }
  }
}