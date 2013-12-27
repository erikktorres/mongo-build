var fs = require('fs');
var util = require('util');

var except = require('./lib/common/except.js');
var fn = require('./lib/common/fn.js');
var pre = require('./lib/common/pre.js');

module.exports = (function(){
  var env = {};

  env.mongo = {};

  // Location of config file for various mongo config settings
  env.mongo.config = fn.returns(JSON.parse(process.env.MONGO_CONFIG || '{}'));

  // Connection string to connect to the local mongo.
  // This should rarely need to be set, as it should build it automatically.
  var mongoConfig = env.mongo.config();
  var localString = 'mongodb://localhost:27017/?';
  if (mongoConfig.replSet != null) {
    localString = util.format('%s&replSet=%s', localString, env.mongo.replSet());
  }
  if (mongoConfig.ssl != null) {
    localString = util.format('%s&ssl=%s', localString, env.mongo.replSet());
  }
  env.mongo.connectionString = fn.returns(process.env.MONGO_CONNECTION_STRING || localString);

  env.backup = {};

  // How often to run a backup
  env.backup.period = fn.returns(process.env.BACKUP_PERIOD || 'day');

  // The local directory to put the backup in
  env.backup.storage = fn.returns(process.env.BACKUP_STORAGE || null);

  // Extra command-line arguments for mongodump
  env.backup.mongodumpCmdArgs = fn.returns(JSON.parse(process.env.BACKUP_MONGODUMP_CMD_ARGS || "[]"));

  /*
   Configuration of pusher, s3pusher is only currently known pusher.

   s3Pusher follows a structure of

   {
     type: 's3',
     s3: { ... },
     pusher: { 
       bucket: 'the s3 bucket to push to',
       keyPrefix: 'a prefix to add to keys, should not end or begin with a /'
     }
   }

   Where s3 can be

   1) Pull from EC2 metadata
   {
     type: 'metadata',
     config: { ... }
   }

   2) Pull from file
   {
     type: 'file',
     file: 'the_file',
     config: { ... }
   }

   3) Provided statically
   {
     type: 'static',
     config: { ... }
   }

   The config object in all three cases is just an object of parameters that are passed
   along to the AWS.S3 constructor.
  */
  var pusherSpec = process.env.PUSHER || null;
  env.pusher = fn.returns(pusherSpec == null ? null : JSON.parse(pusherSpec));

  return env;
})();