var chokidar = require('chokidar');
var util = require('util');
var fs = require('fs');
var url = require('url');
var path = require('path');

var debug = util.debuglog('amok-hotpatch');

function plugin(glob, options) {
  if (typeof options === 'undefined') {
    options = {};
  }

  return function hotpatch(client, runner, done) {
    var sources = runner.get('scripts') || {}
    var cwd = runner.get('cwd') || process.cwd();

    var dirnames = Object.keys(sources).map(function (src) {
      return path.dirname(sources[src]);
    });

    if (typeof glob === 'string') {
      dirnames.push(glob);
    }

    debug('watch %s', dirnames.join(' '));
    var watcher = chokidar.watch(dirnames, {
      alwaysStat: true
    });

    watcher.once('error', function bail(error) {
      debug('bail %s', error.description);
      done(error);
    });

    watcher.once('ready', function ready() {
      debug('ready');
      done();
    });

    runner.once('close', function close() {
      debug('close');
      watcher.close();
    });

    client.on('connect', function () {
      debug('connect');

      var scripts = [];

      client.debugger.on('clear', function () {
        debug('clear');
        scripts.slice(0, scripts.length);
      });

      client.debugger.on('scriptParse', function (script) {
        var scriptUrl = url.parse(script.url);

        if (scriptUrl.protocol === 'file:') {
          script.filename = path.normalize(scriptUrl.pathname);
        } else if (scriptUrl.protocol === 'http:') {
          if (sources[scriptUrl.pathname.slice(1)]) {
            script.filename = sources[scriptUrl.pathname.slice(1)];
          } else {
            script.filename = path.resolve(cwd, scriptUrl.pathname.slice(1));
          }
        }

        if (script.filename) {
          scripts.push(script);
          debug('parse %s', util.inspect(script));
        }
      });

      watcher.on('change', function change(filename, stat) {
        debug('change %s', filename);

        if (stat.size === 0) {
          return debug('stat size 0');
        }

        var script = scripts.filter(function (script) {
          if (script.filename === undefined) {
            return false;
          }

          return path.resolve(script.filename) === path.resolve(filename);
        })[0];

        if (script === undefined) {
          return debug('skip %s', filename);
        }

        debug('read %s', script.filename);
        fs.readFile(script.filename, 'utf-8', function (error, source) {
          if (error) {
            return client.emit('error', error);
          }

          debug('patch %s %d', script.url, source.length);
          client.debugger.setScriptSource(script, source, function (error, result) {
            if (error) {
              debug('error %s', util.inspect(error));
              return client.emit('error', error);
            }

            var detail = JSON.stringify({
              detail: {
                filename: path.relative(cwd, filename),
                source: source,
              }
            });

            var cmd = 'var event = new CustomEvent(\'patch\',' +
              detail + ');\nwindow.dispatchEvent(event);';

            debug('dispatch');
            client.runtime.evaluate(cmd, function (error) {
              if (error) {
                debug('error %s', util.inspect(error));
                return client.emit('error', error);
              }
            });
          });
        });
      });

      client.debugger.enable(function (error) {
        if (error) {
          return client.emit('error', error);
        }

        debug('debugger');
      });

      client.runtime.enable(function (error) {
        if (error) {
          return client.emit('error', error);
        }

        debug('runtime');
      });
    });
  };
}

module.exports = plugin;
