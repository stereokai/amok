var cmd = require('commander');
var veer = require('./');
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

  veer.bundle(cmd, function() {
    console.log('bundler');
  });
}

// serve scripts and resources
var server = veer.serve(cmd, function() {
  if (cmd.browser) {
    var browser = veer.browse(cmd, function() {
    });
  }
});
