var children = require('child_process');
var util = require('util');

var shell = require('shelljs');

var log = require('../log.js')('runner.js');
var pre = require('../common/pre.js');

module.exports = function(config) {
  var dbPath = pre.notNull(config.dbPath(), "Must specify a dbPath for the mongo DB");
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

      var pwd = shell.pwd();
      mongo = children.spawn(
        'bin/mongod',
        ['--config', config.configFile(), '--dbpath', dbPath],
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
        if (code == 0) {
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