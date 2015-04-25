var test = require('tape');
var child = require('child_process');
var fs = require('fs');
var util = require('util');

test('cli script events', function(t) {
  var arguments = [
    'test/fixture/events-plain/index.js',
    'test/fixture/events-babel/index.js --compiler babel',
    'test/fixture/events-babel/index.js --compiler browserify -- --transform babelify',
    'test/fixture/events-babel/index.js --compiler webpack -- --module-bind js=babel',
    'test/fixture/events-coffeescript/index.coffee --compiler coffeescript',
    'test/fixture/events-plain/index.js --compiler webpack',
    'test/fixture/events-plain/index.js --compiler browserify',
    'test/fixture/events-typescript/index.ts --compiler typescript',
  ];

  arguments.forEach(function(args) {
    var argv = args.split(' ');

    var filename = argv[0];
    var pathname = filename.replace(/\.[^.]*$/, '.js')

    argv.unshift('./bin/cmd.js', '--client', 'chrome');
    t.test(argv.join(' '), function(t) {
      t.plan(6);
      t.timeoutAfter(5000);

      var exe = child.spawn('node', argv);

      exe.stdout.on('error', function(error) {
        t.error(error);
      });

      exe.stdout.once('data', function(data) {
        data = data.toString();
        t.equal(data, 'ok\n', 'script loaded');

        fs.readFile(filename, 'utf-8', function(error, contents) {
          t.error(error, 'read script source');

          exe.stdout.once('data', function(data) {
            data = data.toString();
            t.equal(data, util.format('change %s\n', pathname), 'script change event');

            exe.stdout.once('data', function(data) {
              data = data.toString();
              t.equal(data, util.format('source %s\n', pathname), 'script source event');

              fs.writeFile(filename, contents, function(error) {
                t.error(error, 'write original script source');
                exe.kill();
              });
            });
          });

          var touched = contents.replace('false', 'true');
          fs.writeFile(filename, touched, function(error) {
            t.error(error, 'write modified script source');
          });
        });
      });

      exe.on('close', function(code) {
        t.end();
      });
    });
  });
});
