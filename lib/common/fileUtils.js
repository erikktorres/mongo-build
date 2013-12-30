var child_process = require('child_process');
var path = require('path');
var util = require('util');

var shell = require('shelljs');

var log = require('../log.js')('fileUtils.js');

exports.buildTar = function(inputDir, outFile, cb) {
  log.info("Tarring up backup at[%s] to [%s]", inputDir, outFile);
  var inputFile = path.basename(inputDir);
  var workingDir = path.dirname(inputDir);
  child_process.exec(
    util.format('tar czf %s %s', outFile, inputFile), {cwd: workingDir}, function(err, stdout, stdin) {
    if (err != null) {
      return cb({
        message: util.format("Unable to tar[%s]:", outFile, err.message),
        stack: err.stack
      });
    }
    return cb();
  });
}

exports.deleteDir = function(dir) {
  shell.rm('-rf', dir);
}

