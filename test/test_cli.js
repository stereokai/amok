var test = require('tape');
var child = require('child_process');
var fs = require('fs');
var util = require('util');

test('cli emit browser events', function(t) {
  var arguments = [
    'test/fixture/babel.js --compiler babel',
    'test/fixture/bundle-babel.js --compiler browserify -- --transform babelify',
    'test/fixture/bundle.js --compiler browserify',
    'test/fixture/bundle.js --compiler webpack',
    'test/fixture/bundle-babel.js --compiler webpack -- --module-bind js=babel',
    'test/fixture/coffeescript.coffee --compiler coffeescript',
    'test/fixture/plain.js',
    'test/fixture/typescript.ts --compiler typescript'
  ];

  arguments.forEach(function(args) {
    var argv = args.split(' ');

    var filename = argv[0];
    argv.unshift('./bin/cmd.js', '--client', 'chrome');

    t.test(argv.join(' '), function(t) {
      t.plan(6);
      t.timeoutAfter(5000);

      var exe = child.spawn('node', argv);
      exe.stderr.pipe(process.stderr);
      exe.stdout.pipe(process.stdout);

      exe.stdout.on('error', function(error) {
        t.error(error);
      });

      exe.stdout.once('data', function(data) {
        data = data.toString();
        t.equal(data, 'ok\n');

        fs.readFile(filename, 'utf-8', function(error, contents) {
          t.error(error);

          exe.stdout.once('data', function(data) {
            data = data.toString();
            t.equal(data, util.format('change %s\n', filename));

            exe.stdout.once('data', function(data) {
              data = data.toString();
              t.equal(data, util.format('source %s\n', filename));

              fs.writeFile(filename, contents, function(error) {
                t.error(error);
                exe.kill();
              });
            });
          });

          var modified = contents + ' ';
          fs.writeFile(filename, modified, function(error) {
            t.error(error);
          });
        });
      });

      exe.on('close', function(code) {
        t.end();
      });
    });
  });
});
