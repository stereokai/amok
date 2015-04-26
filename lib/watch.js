var chokidar = require('chokidar');
var path = require('path');
var url = require('url');
var fs = require('fs');
var extend = require('extend');

function watch(options) {
  var options = extend({
    cwd: process.cwd(),
    scripts: {}
  }, arguments[2] === undefined ? {} : arguments[2]);

  var watcher = chokidar.watch(options.watch, {
    persistent: true,
    ignored: /[\/\\]\./
  });

  for (var name in options.scripts) {
    if (options.scripts.hasOwnProperty(name)) {
      var dirname = path.dirname(name);
      watcher.add(dirname);
    }
  }

  return watcher;
}

module.exports = watch;
