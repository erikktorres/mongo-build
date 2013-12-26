var path = require('path');

var shell = require('shelljs');

var fixture = require('../fixture.js');
var expect = fixture.expect;

describe("fileUtils.js", function(){
  var fileUtils = require('../../lib/common/fileUtils.js');

  describe("buildTar()", function(){
    var tmpDir = path.join(shell.tempdir(), 'buildTarTest');

    beforeEach(function(){
      shell.rm('-rf', tmpDir);
      shell.mkdir('-p', tmpDir);
    });

    it("should create a tar file", function(done){
      var baseDir = path.join(tmpDir, 'createTarFile');
      var dataDir = path.join(baseDir, 'dataDir');
      var tarFile = path.join(baseDir, 'theTar.tar.gz');

      shell.mkdir('-p', dataDir);

      'billy'.to(path.join(dataDir, 'billy.txt'));
      'sally'.to(path.join(dataDir, 'sally.txt'));

      fileUtils.buildTar(dataDir, tarFile, function(err){
        expect(shell.ls(tarFile)).length(1);
        done(err);
      });
    });
  });

  describe("deleteDir()", function(){
    var tmpDir = path.join(shell.tempdir(), 'deleteDirTest');

    beforeEach(function(){
      shell.rm('-rf', tmpDir);
      shell.mkdir('-p', tmpDir);
    });

    it("should delete a directory", function(){
      var dataDir = path.join(tmpDir, 'dataDir');
      shell.mkdir('-p', dataDir);
      'billy'.to(path.join(dataDir, 'billy.txt'));
      'sally'.to(path.join(dataDir, 'sally.txt'));

      expect(shell.ls(tmpDir)).deep.equals(['dataDir']);
      expect(shell.ls(dataDir)).deep.equals(['billy.txt', 'sally.txt']);

      fileUtils.deleteDir(dataDir);

      expect(shell.ls(tmpDir)).is.empty;
    });
  })
});