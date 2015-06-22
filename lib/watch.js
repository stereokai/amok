const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok-watch');

function plugin(glob) {
  return function watch(client, runner, done) {
    var files = runner.get('scripts') || { };
    var cwd = runner.get('cwd') || process.cwd();

    debug('watch %s', glob);

    var watcher = chokidar.watch(glob, {
      ignoreInitial: true,
      cwd: cwd,
    });

    watcher.once('error', function error(error) {
      debug('error %s', util.inspect(error));
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

    client.on('connect', function() {
      var events = ['add', 'change',  'unlink'];
      events.forEach(function(event) {
        watcher.on(event, function emit(filename) {
          debug('%s %s', event, filename);

          var detail = JSON.stringify({
            detail: {
              filename: url.resolve('/', filename).slice(1)
            }
          });

          var cmd = 'var event = new CustomEvent(\'' + event + '\',' +
          detail + ');\nwindow.dispatchEvent(event);';

          client.runtime.evaluate(cmd, function(error, result) {
            if (error) {
              debug('error %s', error.description);
              return client.emit('error', error);
            }
          });
        });
      });

      client.runtime.enable(function(error) {
        if (error) {
          return client.emit('error', error);
        }

        debug('runtime');
      });
    });
  };
}

module.exports = plugin;
