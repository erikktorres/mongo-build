var fixture = require('../fixture.js');

var expect = fixture.expect;
var sinon = fixture.sinon;
var mockableObject = fixture.mockableObject;
var makeConfig = fixture.makeConfig;

describe('s3pusher.js', function(){
  var s3Pusher = require('../../lib/aws/s3pusher.js');
  var s3 = mockableObject.make('putObject');
  var filesystem = mockableObject.make('createReadStream');

  describe("", function(){
    beforeEach(function(){
      mockableObject.reset(s3, filesystem);
    })

    var runTest = function(config) {
      var pusher = s3Pusher(
        s3, 
        config, 
        function(){ return require('moment')(0).add('hour', 13).utc();},
        filesystem
      );

      sinon.stub(s3, 'putObject');
      sinon.stub(filesystem, 'createReadStream').returnsArg(0)
      var myFn = function(){};
      pusher.push('test.file', myFn);

      expect(s3.putObject).have.been.calledOnce;
      expect(s3.putObject).have.been.calledWith(
        {
          Bucket: 'testBucket',
          Key: 'a/prefix/y=1970/m=01/d=01/H=13/M=00/test.file',
          Body: 'test.file',
          ACL: 'private',
          ServerSideEncryption: 'AES256'
        }, 
        myFn
      );
      expect(filesystem.createReadStream).have.been.calledOnce;
    }

    it ('passes a sanity check.', function(){
      runTest({
        bucket: 'testBucket',
        keyPrefix: 'a/prefix'
      });
    });

    it ('removes slashes on the end of the keyPrefix.', function(){
      runTest({
        bucket: 'testBucket',
        keyPrefix: 'a/prefix//////'
      });
    });

    it ('removes slashes at the beginning of the keyPrefix.', function(){
      runTest({
        bucket: 'testBucket',
        keyPrefix: '//////a/prefix'
      });
    });

    it ('removes slashes at the bothEnds of the keyPrefix.', function(){
      runTest({
        bucket: 'testBucket',
        keyPrefix: '//////a/prefix/////'
      });
    });

    it ("doesn't get caught up on a keyPrefix of only slashes.", function(){
      config = {
        bucket: 'testBucket',
        keyPrefix: '//////'
      };
      var pusher = s3Pusher(s3, config, function(){ return require('moment')(0).add('hour', 13).utc();}, filesystem);
      sinon.stub(s3, 'putObject');
      sinon.stub(filesystem, 'createReadStream').returnsArg(0);
      var myFn = function(){};
      pusher.push('test.file', myFn);

      expect(s3.putObject).have.been.calledOnce;
      expect(s3.putObject).have.been.calledWith(
        {
          Bucket: 'testBucket',
          Key: 'y=1970/m=01/d=01/H=13/M=00/test.file',
          Body: 'test.file',
          ACL: 'private',
          ServerSideEncryption: 'AES256'
        },
        myFn
      );
      expect(filesystem.createReadStream).have.been.calledOnce;
    });
  });
});