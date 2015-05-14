var chokidar = require('chokidar');
var extend = require('extend');
var fs = require('fs');
var path = require('path');
var url = require('url');

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
