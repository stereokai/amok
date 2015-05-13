var amok = require('../');
var test = require('tape');

var browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function(name) {
  test('browse about:blank with ' + name, function(t) {
    t.plan(2);

    amok.browse(name, ['about:blank'], function(error, browser) {
      t.error(error);
      t.ok(browser.pid);

      t.on('end', function() {
        browser.kill();
      });
    });
  });
});
