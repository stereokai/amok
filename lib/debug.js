var rdbg = require('rdbg');
var url = require('url');
var path = require('path');
var fs = require('fs');
var extend = require('extend');
var repl = require('repl');
var util = require('util');

function debug(port, host) {
  var options = extend({
    cwd: process.cwd(),
    scripts: {},
    watcher: undefined,
    interactive: false,
  }, arguments[2] === undefined ? {} : arguments[2]);

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

  var resolve = function(filename) {
    if (options.scripts[filename]) {
      return options.scripts[filename];
    }

    return path.relative(options.cwd, filename);
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

  if (options.watcher !== undefined) {
    options.watcher.on('add', function(filename) {
      var pathname = resolve(filename);
      emit('add', pathname);
    });

    options.watcher.on('remove', function(filename) {
      var pathname = resolve(filename);
      emit('remove', pathname);
    });

    options.watcher.on('change', function(filename) {
      var pathname = resolve(filename);
      emit('change', pathname);

      setTimeout(function() {
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
      }, 100);
    });

    bugger.on('source', function(script) {
      var location = url.parse(script.url);
      var pathname = path.relative('/', location.pathname || '');
      emit('source', pathname);
    });
  }

  bugger.on('detatch', reattach);

  if (options.interactive) {
    var rli = repl.start({
      prompt: '> ',
      writer: function(output) {
        if (output === undefined) {
          return '';
        }

        switch (output.type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'undefined':
          return util.inspect(eval(output.value), { colors: true });

        case 'object':
        case 'function':
          if (output.value === null) {
            return util.inspect(null, { colors: true });
          } else {
            return '[' + output.className + ']';
          }
        }
      },
      eval: function(cmd, context, filename, callback) {
        bugger.evaluate(cmd, callback);
      },
    });

    rli.complete = function(line, callback) {
      callback([], line);
    };

    bugger.console.on('data', function(message) {
      rli.output.clearLine();
      rli.output.cursorTo(0);
      rli.output.write(message.text + '\n');
      rli.prompt(true);
    });
  } else {
    bugger.console.on('data', function(message) {
      process.stdout.write(message.text + '\n');
    });
  }

  process.nextTick(reattach);

  return bugger;
}

module.exports = debug;
