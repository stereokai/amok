var chokidar = require('chokidar');
var extend = require('extend');
var fs = require('fs');
var path = require('path');
var url = require('url');

function watch(glob) {
  var options = {
    cwd: process.cwd()
  };

  if (arguments.length === 2) {
    var callback = arguments[1];
  } else {
    var options = extend(options, arguments[1]);
    var callback = arguments[2];
  }

  var watcher = chokidar.watch(glob, {
    persistent: true,
    ignored: /[\/\\]\./
  });

  watcher.on('error', callback);
  watcher.on('ready', function() {
    watcher.removeListener('error', callback);
    callback(null, watcher);
  });
}

module.exports = watch;
