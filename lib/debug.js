var rdbg = require('rdbg');

function debug(options, callback) {
  var bugger = rdbg.connect(options.debuggerPort, options.debuggerHost);

  var reattach = function() {
    bugger.targets(function(targets) {
      var target = targets.filter(function(target) {
        return target.url.search(options.url) > -1 && target.webSocketDebuggerUrl;
      })[0];

      if (target !== undefined) {
        bugger.attach(target);
      } else {
        setTimeout(autoconnect, 250);
      }
    });
  };

  if (callback) {
    bugger.on('attach', callback);
  }

  bugger.on('detatch', reattach);
  process.nextTick(reattach);

  return bugger;
}

module.exports = debug;
