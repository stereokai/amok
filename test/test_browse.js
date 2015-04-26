var amok = require('../');
var test = require('tape');

test('browse chrome', function(t) {
  var browser = amok.browse('chrome', ['about:blank']);
  browser.on('ready', function() {
    t.ok(browser.pid);
    browser.kill();
  });

  browser.on('close', function(code) {
    t.equal(code, 0);
    t.end();
  });
});
