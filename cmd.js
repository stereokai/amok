#!/usr/bin/env node

var cmd = require('commander');
var amok = require('./');
var temp = require('temp');
var path = require('path');
var async = require('async');

var pkg = require('./package.json');

cmd.usage('[options] <script>');

cmd.option('-h, --host <HOST>', 'specify http host', 'localhost');
cmd.option('-p, --port <PORT>', 'specify http port', 9966);

cmd.option('-H, --debugger-host <HOST>', 'specify debugger host', 'localhost');
cmd.option('-P, --debugger-port <PORT>', 'specify debugger port', 9222);
cmd.option('-v, --verbose', 'enable verbose logging mode');

cmd.option('--no-bundler', 'disable bundling');
cmd.option('--no-browser', 'disable browsing');
cmd.option('--no-debugger', 'disable debugging');

cmd.version(pkg.version);
cmd.parse(process.argv);

cmd.cwd = process.cwd();
if (cmd.browser !== false) {
  cmd.browser = process.env['BROWSER'];
}

if (cmd.bundler !== false) {
  cmd.bundler = process.env['BUNDLER'];
}

async.auto({
  bundler: function(callback, data) {
    if (cmd.bundler) {
      if (cmd.verbose) {
        console.info('Spawning bundler...');
      }

      cmd.scripts = { 'bundle.js': temp.path({suffix: '.js'}) };

      cmd.args.push('-o');
      cmd.args.push(cmd.scripts['bundle.js']);

      var bundler = amok.bundle(cmd, function(error, stdout, stderr) {
        callback(null, bundler);
      });
    } else {
      cmd.scripts = cmd.args.reduce(function(object, value, key) {
        object[value] = path.resolve(value);
        return object;
      }, {});

      callback();
    }
  },

  watcher: function(callback, data) {
    var watcher = amok.watch(cmd, function() {
      if (cmd.verbose) {
        console.info('File watcher ready');
      }

      for (var script in cmd.scripts) {
        var filename = cmd.scripts[script];
        watcher.add(filename);

        if (cmd.verbose) {
          console.info('Watching script file', filename, 'for changes');
        }
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
  },

  server: function(callback, data) {
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
  },

  browser: ['server', function(callback, data) {
    if (cmd.browser) {
      if (cmd.verbose) {
        console.log('Spawning browser...');
      }

      var browser = amok.browse(cmd, function(error, stdout, stderr) {
        if (error) {
          process.stdout.write(error);
        }

        process.stdout.write(stdout);
        process.stderr.write(stderr);
        callback();
      });
    } else {
      callback();
    }
  }],

  bugger: ['browser', 'watcher', function(callback, data) {
    if (cmd.debugger) {
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
    }
  }],
}, function(error) {
  if (error) {
    return console.error(error);
  }
});
