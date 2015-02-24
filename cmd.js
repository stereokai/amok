var cmd = require('commander');
var veer = require('./');
var pkg = require('./package.json');

cmd.usage('[options] <script>');

cmd.option('-h, --host <HOST>', '', 'localhost');
cmd.option('-p, --port <PORT>', '', 9966);

cmd.version(pkg.version);
cmd.parse(process.argv);

cmd.cwd = process.cwd();
cmd.browser = process.env['BROWSER'];

// serve scripts and resources
var server = veer.serve(cmd, function() {
  if (cmd.browser) {
    var browser = veer.browse(cmd, function() {
    });
  }
});
