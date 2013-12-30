var log = require('../log.js')('polling.js');
var util = require('util');

function repeatAfterDelay(name, fn, delay) {
  setTimeout(
    function(){
      fn(function(err){
        if (err == null) {
          repeatAfterDelay(name, fn, delay);
        }
        else {
          if (err !== 'stop') {
            log.info("Job[%s] stopping because of error[%s]", name, util.inspect(err));
          }
          log.info('Job[%s] stopping', name);
        }
      });
    },
    typeof delay === 'function' ? delay() : delay
  ).unref();  
};

exports.repeatAfterDelay = repeatAfterDelay;