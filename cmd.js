#!/usr/bin/env node

var cmd = require('commander');
var amok = require('./');
var temp = require('temp');

var pkg = require('./package.json');

cmd.usage('[options] <script>');

cmd.option('-h, --host <HOST>', 'specify http host', 'localhost');
cmd.option('-p, --port <PORT>', 'specify http port', 9966);

cmd.option('-H, --debugger-host <HOST>', 'specify debugger host', 'localhost');
cmd.option('-P, --debugger-port <PORT>', 'specify debugger port', 9222);

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

cmd.scripts = cmd.args.reduce(function(object, value, key) {
  object[value] = value;
  return object;
}, {});

if (cmd.bundler) {
  cmd.scripts = { 'bundle.js': temp.path({suffix: '.js'}) };

  cmd.args.push('-o');
  cmd.args.push(cmd.scripts['bundle.js']);
  
  amok.bundle(cmd, function(error, stdout, stderr) {
//    process.stdout.pipe(stdout);
//    process.stderr.pipe(stderr);
  });
}

var watcher = amok.watch(cmd, function() {
  for (var script in cmd.scripts) {
    var filename = cmd.scripts[script];
    watcher.add(filename);
  }
});

setTimeout(function() {
  if (cmd.debugger) {
    var bugger = amok.debug(cmd, function(target) {
    });
    
    bugger.on('detach', function() {
      console.info('Debugger detatched');
    });
    
    bugger.on('attach', function(target) {
      console.info('Debugger attached to %s', target.url);
    });

    watcher.on('change', function(filename) {
      var script = Object.keys(cmd.scripts).filter(function(key) { return cmd.scripts[key] === filename})[0];
      if (script) {
        bugger.source(script, null, function(error) {
          if (error) {
            return console.error(error);
          }

          console.info('Re-compilation succesful');
        });
      }
    });
  }
}, 500);

var server = amok.serve(cmd, function() {
  var address = server.address();
  console.info('Server listening on http://%s:%d', address.address, address.port);
  
  if (cmd.browser) {
    var browser = amok.browse(cmd, function(error, stdout, stderr) {
      if (error) {
        process.stdout.write(error);
      }

      process.stdout.write(stdout);
      process.stderr.write(stderr);
    });
  }
});
