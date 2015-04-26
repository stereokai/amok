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
      t.plan(5);

      var exe = amok.compile(compiler.name, compiler.args, compiler.options);
      var pathname = compiler.args[0].replace(/\.[^.]*$/, '.js');

      exe.on('error', function(error) {
        t.error(error);
      });

      exe.on('ready', function(scripts) {
        var filenames = Object.keys(scripts);
        var pathnames = filenames.map(function(filename) {
          return scripts[filename];
        });

        t.equal(filenames.length, 1, 'compile has one script');
        t.equal(pathnames[0], pathname, 'script pathname is equal to input pathname');

        var filename = filenames[0];
        fs.readFile(filename, 'utf-8', function(error, actual) {
          t.error(error, 'read script source');

          var dirname = path.dirname(compiler.args[0]);
          var filename = path.join(dirname, 'expect.js');

          fs.readFile(filename, 'utf-8', function(error, expect) {
            t.error(error, 'read expected script source');
            t.equal(actual, expect, 'script source is equal to expected script source');
          });
        });
      });

      t.on('end', function() {
        exe.kill();
      });
    });
  });
});
