var rdbg = require('rdbg');
var url = require('url');
var path = require('path');
var fs = require('fs');

function debug(port, host, options, callback) {
  var bugger = rdbg.connect(port, host);

  var reattach = function() {
    bugger.targets(function(targets) {
      var target = targets.filter(function(target) {
        return target.url.search(options.url) > -1 && target.webSocketDebuggerUrl;
      })[0];

      if (target !== undefined) {
        bugger.attach(target);
      } else {
        setTimeout(reattach, 250);
      }
    });
  };

  var scripts = options.scripts || {};
  var resolve = function(filename) {
    if (scripts[filename]) {
      return scripts[filename];
    }

    return path.relative(cwd, filename);
  };

  var emit = function(event, filename) {
    var source = 'if (typeof(window) !== \'undefined\') {'
               + '  var e = new CustomEvent(\'' + event + '\','
               + '    { detail: \'' + filename + '\' });'
               + ''
               + '  window.dispatchEvent(e);'
               + '}';
    +''
    + 'if (typeof(process) !== \'undefined\') {'
    + '  process.emit(\'' + event + '\', \'' + filename + '\');'
    + '}';

    bugger.evaluate(source, function(error, result) {
      if (error) {
        bugger.emit('error', error);
      }
    });
  };

  var watcher = options.watcher;
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

  if (callback) {
    bugger.on('attach', callback);
  }

  bugger.on('detatch', reattach);
  process.nextTick(reattach);

  return bugger;
}

module.exports = debug;
