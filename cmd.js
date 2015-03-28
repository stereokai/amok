#!/usr/bin/env node

var amok = require('./');
var async = require('async');
var cmd = require('commander');
var path = require('path');
var temp = require('temp');

var pkg = require('./package.json');

cmd.usage('[options] <script>');

cmd.option('-h, --host <HOST>', 'specify http host', 'localhost');
cmd.option('-p, --port <PORT>', 'specify http port', 9966);

cmd.option('-H, --debugger-host <HOST>', 'specify debugger host', 'localhost');
cmd.option('-P, --debugger-port <PORT>', 'specify debugger port', 9222);

cmd.option('-v, --verbose', 'enable verbose logging mode');

cmd.option('--no-bundler', 'disable bundling');
cmd.option('--no-browser', 'disable browsing');

cmd.version(pkg.version);
cmd.parse(process.argv);

cmd.cwd = process.cwd();
if (cmd.browser !== false) {
  cmd.browser = process.env['BROWSER'] || process.env['AMOK_BROWSER'];
}

if (cmd.bundler !== false) {
  cmd.bundler = process.env['BUNDLER'] || process.env['AMOK_BUNDLER'];
}

async.auto({
  bundler: function(callback, data) {
    if (cmd.bundler) {
      if (cmd.verbose) {
        console.info('Spawning bundler...');
      }

      temp.track();
      temp.mkdir('amok', function(err, dirpath) {
        cmd.output = path.join(dirpath, 'bundle.js');
        cmd.scripts = { 'bundle.js': cmd.output };

        var bundler = amok.bundle(cmd, function(error, stdout, stderr) {
          if (error) {
            return callback(error);
          }

          stdout.pipe(process.stdout);
          stderr.pipe(process.stderr);

          setTimeout(function() {
            callback(null, bundler);
          }, 200);
        });
      });

    } else {
      cmd.scripts = cmd.args.reduce(function(object, value, key) {
        object[value] = path.resolve(value);
        return object;
      }, {});

      callback(null, null);
    }
  },

  watcher: ['bundler', 'bugger', function(callback, data) {
    var watcher = amok.watch(cmd, function() {
      if (cmd.verbose) {
        console.info('File watcher ready');
      }
      watcher.on('change', function(filename) {
        if (cmd.verbose) {
          console.info(filename, 'changed');
        }

        var script = Object.keys(cmd.scripts)
          .filter(function(key) {
            return cmd.scripts[key] === filename
          })[0];

        if (script) {
          if (cmd.verbose) {
            console.info('Re-compiling', script, '...');
          }

          data.bugger.source(script, null, function(error) {
            if (error) {
              return console.error(error);
            }

            if (cmd.verbose) {
              console.info('Re-compilation succesful');
            }
          });
        }
      });

      callback(null, watcher);
    });
  }],

  server: ['bundler', function(callback, data) {
    if (cmd.verbose) {
      console.info('Starting server...');
    }

    var server = amok.serve(cmd, function() {
      var address = server.address();
      if (cmd.verbose) {
        console.info('Server listening on http://%s:%d', address.address, address.port);
      }

      callback(null, server);
    });
  }],

  browser: ['server', function(callback, data) {
    if (cmd.browser) {
      if (cmd.verbose) {
        console.log('Spawning browser...');
      }

      var browser = amok.browse(cmd, function(error, stdout, stderr) {
        if (error) {
          process.stdout.write(error);
        }

        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);

        setTimeout(function () {
          callback(null, browser);
        }, 1000);
      });
    } else {
      callback(null, null);
    }
  }],

  bugger: ['browser', function(callback, data) {
    if (cmd.verbose) {
      console.info('Attaching debugger...');
    }

    var bugger = amok.debug(cmd, function(target) {
      if (cmd.verbose) {
        console.info('Debugger attached to %s', target.url);
      }
      
      bugger.on('detach', function() {
        if (cmd.verbose) {
          console.info('Debugger detatched');
        }
      });

      bugger.on('attach', function(target) {
        if (cmd.verbose) {
          console.info('Debugger attached to %s', target.url);
        }
      });

      callback(null, bugger);
    });
  }],
}, function(error) {
  if (error) {
    return console.error(error);
  }
});
