var test = require('tape');
var child = require('child_process');

test('cli chrome, server without compiler', function(t) {
  t.plan(1);

  var exe = child.spawn('node', [
    './bin/cmd.js',
    '--client',
    'chrome',
    'test/fixture/plain.js'
  ]);

  exe.stdout.once('data', function(data) {
    data = data.toString();

    t.equal(data, 'ok\n');
    exe.kill();
  });

  exe.on('close', function(code) {
    t.end();
  });
});

test('cli chrome, server with browserify', function(t) {
  t.plan(1);

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
    exe.kill();
  });

  exe.on('close', function(code) {
    t.end();
  });
});

test('cli chrome, server with browserify and babelify transform', function(t) {
  t.plan(1);

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
    exe.kill();
  });

  exe.on('close', function(code) {
    t.end();
  });
});
