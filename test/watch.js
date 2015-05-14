var amok = require('../');
var fs = require('fs');
var temp = require('temp');
var test = require('tape');
var path = require('path');
var chokidar = require('chokidar');

test('watch two different tempdirs', function(t) {
  t.plan(32);

  var dirname1 = temp.mkdirSync('watch-dir');
  var dirname2 = temp.mkdirSync('watch-files');

  var files = [
    path.join(dirname1, '1.js'),
    path.join(dirname1, '2.js'),
    path.join(dirname1, '3.js'),
    path.join(dirname1, '4.js'),
    path.join(dirname1, '5.js'),
    path.join(dirname2, '1.js'),
    path.join(dirname2, '2.js'),
    path.join(dirname2, '3.js'),
    path.join(dirname2, '4.js'),
    path.join(dirname2, '5.js'),
  ];

  var watcher = amok.watch([dirname1, dirname2], function(error, watcher) {
    t.error(error);
    t.ok(watcher);

    files.forEach(function(filename) {
      fs.writeFileSync(filename, 'add');
    });

    watcher.on('add', function(filename) {
      t.notEqual(files.indexOf(filename), -1, 'file added');
      fs.writeFileSync(filename, 'changed');
    });

    watcher.on('change', function(filename) {
      t.notEqual(files.indexOf(filename), -1, 'file changed');
      fs.unlinkSync(filename);
    });

    watcher.on('unlink', function(filename) {
      t.notEqual(files.indexOf(filename), -1, 'file removed');
    });

    t.on('end', function() {
      watcher.close();
    });
  });
});
