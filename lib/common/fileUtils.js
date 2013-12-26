var child_process = require('child_process');
var path = require('path');
var util = require('util');

var shell = require('shelljs');

var log = require('../log.js')('fileUtils.js');

exports.buildTar = function(inputDir, outFile, cb) {
  log.info("Tarring up backup at[%s] to [%s]", inputDir, outFile);
  var tarFile = path.basename(outFile);
  var outDir = path.dirname(outFile);
  child_process.exec(
    util.format('tar czf %s %s', tarFile, util.format('%s/*', inputDir)), {cwd: outDir}, function(err, stdout, stdin) {
    if (err != null) {
      return cb({
        message: util.format("Unable to tar[%s]:", tarFile, err.message),
        stack: err.stack
      });
    }
    return cb();
  });
}

exports.deleteDir = function(dir) {
  shell.rm('-rf', dir);
}

