var amok = require('../');
var test = require('tape');
var fs = require('fs');
var path = require('path');

var compilers = [
  'babel',
  'browserify',
  'coffee',
  'tsc',
  'webpack',
];

compilers.forEach(function(name) {
  test('compile to temporary file with ' + name, function(t) {
    t.plan(4);

    var dirname = path.join('test/fixture', name);
    var index = fs.readdirSync(dirname).filter(function(filename) {
      return filename.indexOf('index') > -1;
    })[0];

    var filename = path.join(dirname, index);
    var args = [
      filename
    ];

    amok.compile(name, args, function(error, compiler, scripts) {
      t.error(error);
      t.ok(compiler.pid);

      var files = Object.keys(scripts);
      t.equal(files.length, 1);

      var result = fs.readdirSync(dirname).filter(function(filename) {
        return filename.indexOf('output') > -1;
      })[0];

      t.equal(fs.readFileSync(path.join(dirname, result), 'utf-8'), fs.readFileSync(files[0], 'utf-8'));

      t.on('end', function() {
        compiler.kill();
      });
    });
  });
});
