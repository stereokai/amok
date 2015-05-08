var child = require('child_process');
var fs = require('fs');
var pkg = require('../package.json');
var test = require('tape');
var util = require('util');
var path = require('path');

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
  var options = [
    '-h',
    '--help'
  ];

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

var browsers = [
  'chrome',
  'chromium'
];

browsers.forEach(function(browser) {
  test('cli print browser console from ' + browser, function(t) {
    t.plan(2);

    var args = [
      '--browser',
      browser,
      'test/fixture/console/index.js'
    ];

    var exe = child.spawn('node', ['./bin/amok.js'].concat(args));
    exe.stderr.on('data', function(data) {
      var stderr = [
        'error\n'
      ];

      var message = data.toString();
      t.notEqual(stderr.indexOf(message), -1);
    });

    exe.stdout.on('data', function(data) {
      var stdout = [
        'log\n'
      ];

      var message = data.toString();
      t.notEqual(stdout.indexOf(message), -1);
    });

    t.on('end', function() {
      exe.kill();
    });
  });

  test('cli refresh script source in ' + browser, function(t) {
    t.plan(10);

    var args = [
      '--browser',
      browser,
      'test/fixture/source/index.js'
    ];

    var exe = child.spawn('node', ['./bin/amok.js'].concat(args));
    var original = fs.readFileSync('test/fixture/source/index.js', 'utf-8');

    var values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    var source = original.concat();

    exe.stdout.on('data', function(data) {
      var value = parseInt(data.toString());

      if (value === values[0]) {
        t.equal(values.shift(), value);

        source = source.replace(value, values[0]);
        fs.writeFileSync('test/fixture/source/index.js', source, 'utf-8');
      }
    });

    t.on('end', function() {
      fs.writeFileSync('test/fixture/source/index.js', original);
      exe.kill();
    });
  });

  var compilers = [
    'babel',
    'browserify',
    'coffee',
    'tsc',
    'webpack',
  ];

  compilers.forEach(function(compiler) {
    test('cli refresh script source compiled with ' + compiler + ' in ' + browser, function(t) {
      t.plan(10);
      t.timeoutAfter(30000);

      var dirname = path.join('test/fixture/', compiler);
      var index = fs.readdirSync(dirname).filter(function(filename) {
        return filename.indexOf('index') > -1;
      })[0];

      var filename = path.join(dirname, index);

      var args = [
        '--browser',
        browser,
        '--compiler',
        compiler,
        filename
      ];

      var exe = child.spawn('node', ['./bin/amok.js'].concat(args));
      var original = fs.readFileSync(filename, 'utf-8');

      var values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      var source = original.concat();

      exe.stdout.on('data', function(data) {
        var value = parseInt(data.toString());

        if (value === values[0]) {
          t.equal(values.shift(), value);

          source = source.replace(value, values[0]);
          fs.writeFileSync(filename, source, 'utf-8');
        }
      });

      t.on('end', function() {
        fs.writeFileSync(filename, original);
        exe.kill();
      });
    });
  });
});
