var amok = require('../');
var test = require('tape');

var browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function(name) {
  test('browse about:blank with ' + name, function(t) {
    t.plan(1);

    var exe = amok.browse(name, ['about:blank']);
    exe.on('ready', function() {
      t.ok(exe.pid);
    });

    exe.on('error', function(error) {
      t.fail(error);
    });

    t.on('end', function() {
      exe.kill();
    });
  });
});
