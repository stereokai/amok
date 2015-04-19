var test = require('tape');
var child = require('child_process');
var touch = require('touch');

test('cli chrome, server without compiler', function(t) {
  t.plan(4);

  var exe = child.spawn('node', [
    './bin/cmd.js',
    '--client',
    'chrome',
    'test/fixture/plain.js'
  ]);

  exe.stdout.once('data', function(data) {
    data = data.toString();
    t.equal(data, 'ok\n');

    exe.stdout.once('data', function(data) {
      data = data.toString();
      t.equal(data, 'add test/fixture/plain.js\n');

      exe.stdout.once('data', function(data) {
        data = data.toString();
        t.equal(data, 'change test/fixture/plain.js\n');

        exe.stdout.once('data', function(data) {
          data = data.toString();
          t.equal(data, 'source test/fixture/plain.js\n');

          exe.kill();
        });
      });

      touch('test/fixture/plain.js');
    });
  });

  exe.on('close', function(code) {
    t.end();
  });
});

test('cli chrome, server with browserify', function(t) {
  t.plan(4);

  var exe = child.spawn('node', [
    './bin/cmd.js',
    '--client',
    'chrome',
    '--compiler',
    'browserify',
    'test/fixture/bundle.js'
  ]);

  exe.stdout.once('data', function(data) {
    data = data.toString();
    t.equal(data, 'ok\n');

    exe.stdout.once('data', function(data) {
      data = data.toString();
      t.equal(data, 'add test/fixture/bundle.js\n');

      exe.stdout.once('data', function(data) {
        data = data.toString();
        t.equal(data, 'change test/fixture/bundle.js\n');

        exe.stdout.once('data', function(data) {
          data = data.toString();
          t.equal(data, 'source test/fixture/bundle.js\n');

          exe.kill();
        });
      });

      touch('test/fixture/bundle.js');
    });
  });

  exe.on('close', function(code) {
    t.end();
  });
});

test('cli chrome, server with browserify and babelify transform', function(t) {
  t.plan(4);

  var exe = child.spawn('node', [
    './bin/cmd.js',
    '--client',
    'chrome',
    '--compiler',
    'browserify',
    'test/fixture/bundle-babel.js',
    '--',
    '--transform',
    'babelify'
  ]);

  exe.stdout.once('data', function(data) {
    data = data.toString();
    t.equal(data, 'ok\n');

    exe.stdout.once('data', function(data) {
      data = data.toString();
      t.equal(data, 'add test/fixture/bundle-babel.js\n');

      exe.stdout.once('data', function(data) {
        data = data.toString();
        t.equal(data, 'change test/fixture/bundle-babel.js\n');

        exe.stdout.once('data', function(data) {
          data = data.toString();
          t.equal(data, 'source test/fixture/bundle-babel.js\n');

          exe.kill();
        });
      });

      touch('test/fixture/bundle-babel.js');
    });
  });

  exe.on('close', function(code) {
    t.end();
  });
});

test('cli chrome, server with webpack', function(t) {
  t.plan(4);

  var exe = child.spawn('node', [
    './bin/cmd.js',
    '--client',
    'chrome',
    '--compiler',
    'webpack',
    'test/fixture/bundle.js'
  ]);

  exe.stdout.once('data', function(data) {
    data = data.toString();
    t.equal(data, 'ok\n');

    exe.stdout.once('data', function(data) {
      data = data.toString();
      t.equal(data, 'add test/fixture/bundle.js\n');

      exe.stdout.once('data', function(data) {
        data = data.toString();
        t.equal(data, 'change test/fixture/bundle.js\n');

        exe.stdout.once('data', function(data) {
          data = data.toString();
          t.equal(data, 'source test/fixture/bundle.js\n');

          exe.kill();
        });
      });

      touch('test/fixture/bundle.js');
    });
  });

  exe.on('close', function(code) {
    t.end();
  });
});
