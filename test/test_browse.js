var amok = require('../');
var test = require('tape');

var browsers = ['chrome'];
browsers.forEach(function(browser) {
  test('browse about:blank (' + browser + ')', function(t) {
    t.plan(1);

    var exe = amok.browse('chrome', ['about:blank']);
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
