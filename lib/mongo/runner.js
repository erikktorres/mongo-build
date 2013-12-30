var children = require('child_process');
var util = require('util');

var shell = require('shelljs');

var log = require('../log.js')('runner.js');
var pre = require('../common/pre.js');

module.exports = function(config) {
  var mongoConfig = config.config();
  var dbPath = pre.notNull(mongoConfig.dbpath, "Must specify a dbpath in the mongo config");
  shell.mkdir('-p', dbPath);
 
  var mongo = null;
  var stopped = false;

  function waitForStop(cb){
    setTimeout(
      function(){
        if (stopped) {
          cb();
        }
        else {
          waitForStop();
        }
      },
      1000
    );
  };

  return {
    start: function(cb) {
      var self = this;

      var args = [];
      for (var field in mongoConfig) {
        var val = mongoConfig[field];
        if (! (val === 'false' || val === false)) {
          args.push('--'+field);
          if (! (val === 'true' || val === true)) {
            args.push(mongoConfig[field]);
          }
        }
      }

      log.info("Running mongo with args[%s]", args);

      var pwd = shell.pwd();
      mongo = children.spawn(
        'bin/mongod',
        args,
        {cwd: pwd, stdio: ['ignore', process.stdout, process.stderr]}
      );
      mongo.on('error', function(err){ 
        log.error(err, "Error when running mongo, stopping myself.");
        process.emit('SIGTERM');
      });
      mongo.on('exit', function(code) {
        if (code != 0) {
          log.error("mongo failed with non-zero[%s] exit code, stopping myself.", code);
          process.emit('SIGTERM');
        }
        stopped = true;
      })
      mongo.on('close', function(code){
        if (code =! 0) {
          log.error("mongo failed with non-zero[%s] exit code, stopping myself.", code);
          process.emit('SIGTERM');
        }
        stopped = true;
      });
      return cb();
    },
    stop: function(cb) {
      if (mongo != null && !stopped) {
        mongo.kill('SIGTERM');
        waitForStop(cb);
      }
      else {
        cb();
      }
    }
  }
}