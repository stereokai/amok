var amok = require('../');
var test = require('tape');
var fs = require('fs');
var path = require('path');

test('compile to temporary file', function(t) {
  var compilers = [
    {
      name: 'babel',
      args: [
        'test/fixture/compile-babel/index.js',
        'test/fixture/compile-babel/lib.js'
      ]
    },
    {
      name: 'browserify',
      args: [
        'test/fixture/compile-browserify/index.js'
      ]
    },
    {
      name: 'browserify',
      args: [
        'test/fixture/compile-browserify-babel/index.js',
        '--transform',
        'babelify'
      ]
    },
    {
      name: 'coffeescript',
      args: [
        'test/fixture/compile-coffeescript/index.coffee',
        'test/fixture/compile-coffeescript/lib.coffee'
      ]
    },
    {
      name: 'typescript',
      args: [
        'test/fixture/compile-typescript/index.ts',
        'test/fixture/compile-typescript/lib.ts'
      ]
    },
    {
      name: 'webpack',
      args: [
        'test/fixture/compile-webpack/index.js'
      ]
    },
    {
      name: 'webpack',
      args: [
        'test/fixture/compile-webpack-babel/index.js',
        '--module-bind',
        'js=babel'
      ]
    }
  ];

  compilers.forEach(function(compiler) {
    t.test(compiler.name + ' ' + compiler.args.join(' '), function(t) {
      var exe = amok.compile(compiler.name, compiler.args, compiler.options);
      exe.stderr.on('data', function(data) {
        data = data.toString();
        t.fail(data);
      });

      exe.on('error', function(error) {
        t.error(error);
      });

      exe.on('ready', function(scripts) {
        var filenames = Object.keys(scripts);
        t.equal(filenames.length, 1);

        var filename = filenames[0];
        fs.readFile(filename, 'utf-8', function(error, actual) {
          t.error(error);

          var dirname = path.dirname(compiler.args[0]);
          var filename = path.join(dirname, 'expect.js');

          fs.readFile(filename, 'utf-8', function(error, expect) {
            t.error(error);
            t.equal(expect, actual);
          });
        });

        var stats = fs.statSync(filenames[0]);
        t.ok(stats.size > 1);

        var pathnames = filenames.map(function(filename) {
          return scripts[filename];
        });

        t.equal(pathnames.length, 1);
        t.equal(pathnames[0], compiler.args[0].replace(/\.[^.]*$/, '.js'));

        exe.kill();
      });

      exe.on('close', function(code, signal) {
        t.end();
      });
    });
  });
});
