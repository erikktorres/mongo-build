
(function(){
  'use strict'

  var config = require('./env.js');

  require('./lib/mongo/runner.js')(config.mongo).start();

  require('./lib/mongoBackup.js')(
    require('./lib/mongo/client')(config.mongo),
    require('./lib/init/pusher.js')(config.pusher()),
    require('./lib/common/fileUtils.js'),
    require('./lib/common/polling.js'),
    config.backup
  ).start();
})();