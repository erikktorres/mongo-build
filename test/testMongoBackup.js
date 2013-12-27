var fixture = require('./fixture.js');

var expect = fixture.expect;
var sinon = fixture.sinon;
var mockableObject = fixture.mockableObject;
var makeConfig = fixture.makeConfig;

describe('mongoBackup.js', function(){
  var mongoClient = mockableObject.make('connect', 'dump');
  var pusher = mockableObject.make('push');
  var fileUtils = mockableObject.make('buildTar', 'deleteDir');
  var polling = mockableObject.make('repeatAfterDelay');
  var config = makeConfig({
    storage: 'testDir',
    period: 'minute',
    mongodumpCmdArgs: '--ssl'
  });

  beforeEach(function(){
    mockableObject.reset(mongoClient, pusher, fileUtils, polling);
  });

  it('passes a sanity check', function(){
    var backup = require('../lib/mongoBackup.js')(mongoClient, pusher, fileUtils, polling, config);

    sinon.stub(polling, 'repeatAfterDelay');
    backup.start(function(){});

    expect(polling.repeatAfterDelay).have.been.calledOnce;
    expect(polling.repeatAfterDelay).have.been.calledWith('mongo-backup', sinon.match.func, sinon.match.func);

    var backupFn = polling.repeatAfterDelay.getCall(0).args[1];
    var timingFn = polling.repeatAfterDelay.getCall(0).args[2];

    var now = require('moment')();
    var valOfNow = now.valueOf();
    var nextTime = timingFn();
    expect(nextTime).is.below(now.add('minute', 2).valueOf() - valOfNow);


    mockableObject.reset(polling);
    sinon.stub(mongoClient, 'dump').withArgs('--ssl', 'testDir', sinon.match.func).callsArg(2);
    sinon.stub(fileUtils, 'buildTar').withArgs('testDir', 'testDir/mongo-backup.tar.gz', sinon.match.func).callsArg(2);
    sinon.stub(pusher, 'push').withArgs('testDir/mongo-backup.tar.gz').callsArg(1);
    sinon.stub(fileUtils, 'deleteDir').withArgs('testDir');
    backupFn(function(err){
      expect(err).to.not.exist;
      expect(mongoClient.dump).have.been.calledOnce;
      expect(fileUtils.buildTar).have.been.calledOnce;
      expect(pusher.push).have.been.calledOnce;
      expect(fileUtils.deleteDir).have.been.calledOnce;
    });
  });
});