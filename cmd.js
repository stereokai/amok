var cmd = require('commander');
var amok = require('./');
var temp = require('temp');

var pkg = require('./package.json');

cmd.usage('[options] <script>');

cmd.option('-h, --host <HOST>', '', 'localhost');
cmd.option('-p, --port <PORT>', '', 9966);

cmd.version(pkg.version);
cmd.parse(process.argv);

cmd.cwd = process.cwd();
cmd.browser = process.env['BROWSER'];
cmd.bundler = process.env['BUNDLER'];

cmd.scripts = cmd.args.reduce(function(object, value, key) {
  object[key] = value;
  return object;
}, {});

if (cmd.bundler) {
  cmd.scripts = { 'bundle.js': temp.path({suffix: '.js'}) };

  cmd.args.push('-o');
  cmd.args.push(cmd.scripts['bundle.js']);

  amok.bundle(cmd, function() {
    console.log('bundler');
  });
}

var watcher = amok.watch(cmd, function() {
  for (var script in cmd.scripts) {
    var filename = cmd.scripts[script];
    watcher.add(filename);
  }
});

setTimeout(function() {
  var bugger = amok.debug(cmd, function() {
    watcher.on('change', function(filename) {
      var script = Object.keys(cmd.scripts).filter(function(key) { return cmd.scripts[key] === filename})[0];
      if (script) {
        console.log('re-compiling', script);
        bugger.source(script, null, function() {
          console.log('success');
        });
      }
    });
  });
}, 500);

// serve scripts and resources
var server = amok.serve(cmd, function() {
  if (cmd.browser) {
    var browser = amok.browse(cmd, function() {
    });
  }
});
