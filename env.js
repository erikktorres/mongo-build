var fn = require('./lib/common/fn.js');
var pre = require('./lib/common/pre.js');

module.exports = (function(){
  var env = {};

  env.mongo = {};
  env.mongo.dbPath = fn.returns(process.env.MONGO_DB_PATH || null);
  env.mongo.configFile = fn.returns(process.env.MONGO_CONFIG_FILE || 'config/config.conf');

  env.backup = {};

  // How often to run a backup
  env.backup.period = fn.returns(process.env.BACKUP_PERIOD || 'day');

  // Boolean if this is a backup of a replica set
  env.backup.replSet = fn.returns(process.env.BACKUP_REPLICATION_SET || false);

  // The local directory to put the backup in
  env.backup.storage = fn.returns(process.env.BACKUP_STORAGE || null);

  // Extra command-line arguments for mongodump
  env.backup.mongodumpCmdArgs = fn.returns(process.env.BACKUP_MONGODUMP_CMD_ARGS || "");

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