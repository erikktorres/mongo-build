var fixture = require('../fixture.js');

var expect = fixture.expect;
var sinon = fixture.sinon;
var mockableObject = fixture.mockableObject;
var makeConfig = fixture.makeConfig;

describe('s3pusher.js', function(){
  var s3Pusher = require('../../lib/aws/s3pusher.js');
  var s3 = mockableObject.make('putObject');

  beforeEach(function(){
    mockableObject.reset(s3);
  })

  describe("", function(){
    var runTest = function(staticConfig) {
      var config = makeConfig(staticConfig);
      var pusher = s3Pusher(s3, config);
      sinon.stub(s3, 'putObject');
      var myFn = function(){};
      pusher.push('test.file', myFn);

      expect(s3.putObject).have.been.calledOnce;
      expect(s3.putObject).have.been.calledWith(
        {
          Bucket: 'testBucket',
          Key: 'a/prefix/test.file',
          Body: 'test.file',
          ACL: 'private',
          ServerSideEncryption: 'AES256'
        },
        myFn
      );
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
      config = makeConfig({
        bucket: 'testBucket',
        keyPrefix: '//////'
      });
      var pusher = s3Pusher(s3, config);
      sinon.stub(s3, 'putObject');
      var myFn = function(){};
      pusher.push('test.file', myFn);

      expect(s3.putObject).have.been.calledOnce;
      expect(s3.putObject).have.been.calledWith(
        {
          Bucket: 'testBucket',
          Key: 'test.file',
          Body: 'test.file',
          ACL: 'private',
          ServerSideEncryption: 'AES256'
        },
        myFn
      );
    });
  });
});