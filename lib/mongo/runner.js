var children = require('child_process');
var util = require('util');

var shell = require('shelljs');

var log = require('../log.js')('runner.js');
var pre = require('../common/pre.js');

module.exports = function(config) {
  pre.notNull(config.dbPath(), "Must specify a dbPath for the mongo DB");  
  
  return {
    start: function() {
      var self = this;

      var pwd = shell.pwd();
      var mongo = children.spawn(
        'bin/mongod',
        ['--config', config.configFile(), '--dbPath', config.dbPath()],
        {cwd: pwd, stdio: ['ignore', process.stdout, process.stderr]}
      );
      mongo.on('error', function(err){ 
        log.error(err, "Error when running mongo, stopping myself.");
        process.emit('SIGHUP');
      });
      mongo.on('close', function(code){
        if (code == 0) {
          log.error("mongo failed with non-zero[%s] exit code, stopping myself.", code);
          process.emit('SIGHUP');
        }
      });
      return mongo;
    }
  }
}