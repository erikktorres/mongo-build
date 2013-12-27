var mongo = require('mongodb');
var shell = require('shelljs');

var children = require('child_process');
var util = require('util');

module.exports = function(config) {

  return {
    connect: function(cb) {
      mongo.MongoClient.connect(config.connectionString(), cb);
    },
    dump: function(cmdArgs, outDir, cb) {
      var pwd = shell.pwd();
      var mongodump = children.spawn(
        'bin/mongodump',
        cmdArgs.concat(['--out', outDir]),
        {cwd: pwd, stdio: ['ignore', process.stdout, process.stderr]}
      );
      mongodump.on('error', function(err){ cb(err); });
      mongodump.on('close', function(code){
        if (code != 0) {
          return cb({ message: util.format("mongodump failed with non-zero[%s] exit code", code) });
        }
        log.info('mongodump suceeded!');
        cb();
      });
    }
  }
}