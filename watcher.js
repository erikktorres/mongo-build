var async = require('async');

var log = require('./lib/log.js')('watcher.js');

(function(){
  'use strict'

  var config = require('./env.js');

  var mongoRunner = require('./lib/mongo/runner.js')(config.mongo);
  var mongoBackup = require('./lib/mongoBackup.js')(
    require('./lib/mongo/client')(config.mongo),
    require('./lib/init/pusher.js')(config.pusher()),
    require('./lib/common/fileUtils.js'),
    require('./lib/common/polling.js'),
    config.backup
  )

  async.series([
    mongoRunner.start.bind(mongoRunner),
    mongoBackup.start.bind(mongoBackup)
  ],
  function(err){
    if (err != null) {
      log.error(err, 'Problem starting up.  Stopping!');
      process.emit('SIGTERM');
    }
  });

  process.on('SIGINT', process.emit.bind(process, 'SIGTERM'));
  process.on('SIGHUP', process.emit.bind(process, 'SIGTERM'));
  process.on('SIGTERM', function(){
    async.series([
      mongoBackup.stop.bind(mongoBackup),
      mongoRunner.stop.bind(mongoRunner)
    ],
    function(err) {
      if (err != null) {
        log.error(err, 'Problem shutting down!?  Oh well.');
      }
    });
  });
})();