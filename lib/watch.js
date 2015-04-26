var chokidar = require('chokidar');
var path = require('path');
var url = require('url');
var fs = require('fs');
var extend = require('extend');

function watch(patterns, options) {
  var options = extend({
  }, arguments[1] === undefined ? {} : arguments[1]);

  var watcher = chokidar.watch(patterns, {
    persistent: true,
    ignored: /[\/\\]\./
  });

  return watcher;
}

module.exports = watch;
