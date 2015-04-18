var chokidar = require('chokidar');
var path = require('path');
var url = require('url');
var fs = require('fs');

function watch(options, callback) {
  var scripts = options.scripts || {};
  var cwd = options.cwd || process.cwd();

  var watcher = chokidar.watch(options.watch, {
    persistent: true
  });

  for (var name in scripts) {
    if (scripts.hasOwnProperty(name)) {
      var dirname = path.dirname(name);
      watcher.add(dirname);
    }
  }

  var bugger = options.bugger;
  if (bugger) {
    var resolve = function(filename) {
      if (scripts[filename]) {
        return scripts[filename];
      }

      return path.relative(cwd, filename);
    };

    var emit = function(event, filename) {
      var source = 'if (typeof(window) !== \'undefined\') {'
                 + '  var e = new CustomEvent(\''+ event + '\','
                 + '    { detail: \'' + filename +'\' });'
                 + ''
                 + '  window.dispatchEvent(e);'
                 + '}';
                 + ''
                 + 'if (typeof(process) !== \'undefined\') {'
                 + '  process.emit(\'' + event + '\', \'' + filename + '\');'
                 + '}';

      bugger.evaluate(source, function(error, result) {
        if (error) {
          bugger.emit('error', error);
        }
      });
    };

    watcher.on('add', function(filename) {
      var pathname = resolve(filename);
      emit('add', pathname);
    });

    watcher.on('remove', function(filename) {
      var pathname = resolve(filename);
      emit('remove', pathname);
    });

    watcher.on('change', function(filename) {
      var pathname = resolve(filename);
      emit('change', pathname);

      bugger.scripts(function(scripts) {
        var script = scripts.filter(function(script) {
          var location = url.parse(script.url);
          return path.relative('/', location.path || '') === pathname;
        })[0];

        if (script === undefined) {
          return;
        }

        fs.readFile(filename, 'utf-8', function(error, contents) {
          if (error) {
            return bugger.emit('error', error);
          }

          bugger.source(script, contents);
        });
      });
    });

    bugger.on('source', function(script) {
      var location = url.parse(script.url);
      var pathname = path.relative('/', location.pathname || '');
      emit('source', pathname);
    });
  }

  if (callback) {
    watcher.once('ready', callback);
  }

  return watcher;
}

module.exports = watch;
