var child = require('child_process');
var fs = require('fs');
var pkg = require('../package.json');
var test = require('tape');
var util = require('util');

test('cli print version', function(t) {
  t.plan(4);
  var options = ['-V', '--version'];
  options.forEach(function(option) {
    var exe = child.spawn('node', ['./bin/amok.js', option]);

    exe.stdout.on('data', function(data) {
      var message = data.toString();
      t.equal(message, pkg.version + '\n');
    });

    exe.on('close', function(code) {
      t.equal(code, 0);
    });
  });
});

test('cli print help', function(t) {
  t.plan(4);
  var options = ['-h', '--help'];
  options.forEach(function(option) {
    var exe = child.spawn('node', ['./bin/amok.js', option]);

    exe.stdout.on('data', function(data) {
      var message = data.toString();
      t.ok(message.indexOf('Usage:') > -1);
    });

    exe.on('close', function(code) {
      t.equal(code, 0);
    });
  });
});

test('cli script events', function(t) {
  var arguments = [
    'test/fixture/cli-events-plain/index.js',
    'test/fixture/cli-events-babel/index.js --compiler babel',
    'test/fixture/cli-events-babel/index.js --compiler browserify -- --transform babelify',
    'test/fixture/cli-events-babel/index.js --compiler webpack -- --module-bind js=babel',
    'test/fixture/cli-events-coffeescript/index.coffee --compiler coffeescript',
    'test/fixture/cli-events-plain/index.js --compiler webpack',
    'test/fixture/cli-events-plain/index.js --compiler browserify',
    'test/fixture/cli-events-typescript/index.ts --compiler typescript',
  ];

  arguments.forEach(function(args) {
    var argv = args.split(' ');

    var filename = argv[0];
    var pathname = filename.replace(/\.[^.]*$/, '.js');

    argv.unshift('./bin/amok.js', '--browser', 'chrome');
    t.test(argv.join(' '), function(t) {
      t.plan(5);
      t.timeoutAfter(5000);

      var exe = child.spawn('node', argv);
      exe.on('error', function(error) {
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
            });
          });

          t.on('end', function() {
            fs.writeFileSync(filename, contents);
          });

          var touched = contents.replace('false', 'true');
          fs.writeFile(filename, touched, function(error) {
            t.error(error, 'write modified script source');
          });
        });
      });

      t.on('end', function() {
        exe.kill();
      });
    });
  });
});
