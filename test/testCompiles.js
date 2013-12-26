var fixture = require('./fixture.js');
var expect = fixture.expect;

describe("global test", function(){
  it("compiles", function(){
    var path = require('path');
    var util = require('util');

    var shell = require('shelljs');

    shell.cd('test');
    requireFiles('..', ['lib']);
    function requireFiles(prefix, files) {
      expect(files).is.not.empty;
      for (var i = 0; i < files.length; ++i) {
        var file = util.format('%s/%s', prefix, files[i]);
        if (path.extname(file) === '.js') {
          require(file);
        }
        else {
          requireFiles(file, shell.ls(file));
        }
      }
    }
  });
});