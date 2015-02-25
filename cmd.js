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
  
  amok.bundle(cmd, function(error, stdout, stderr) {
    process.stdout.pipe(stdout);
    process.stderr.pipe(stderr);
  });
}

var watcher = amok.watch(cmd, function() {
  for (var script in cmd.scripts) {
    var filename = cmd.scripts[script];
    watcher.add(filename);
  }
});

setTimeout(function() {
  var bugger = amok.debug(cmd, function(target) {
  });
   
  bugger.on('attach', function(target) {
    console.info('debugger attatched to target %s', target.title);
  });

  bugger.on('detatch', function() {
    var id = setInterval(function() {
      client.targets(function(targets) {
        var target = targets.filter(function(target) {
          return target.url.indexOf(cmd.host) > -1;
        })[0];

        client.attach(target);
      });
    }, 500);

    bugger.once('attach', function() {
      clearInterval(id);
    });
  });
  
  watcher.on('change', function(filename) {
    var script = Object.keys(cmd.scripts).filter(function(key) { return cmd.scripts[key] === filename})[0];
    if (script) {
      bugger.source(script, null, function(error) {
        if (error) {
          return console.error(error);
        }

        console.info('re-compilation succesful');
      });
    }
  });
}, 500);

var server = amok.serve(cmd, function() {
  var address = server.address();
  console.info('http server listening on http://%s:%d', address.address, address.port);
  
  if (cmd.browser) {
    var browser = amok.browse(cmd, function(error, stdout, stderr) {
      process.stdout.pipe(stdout);
      process.stderr.pipe(stderr);
    });
  }
});
