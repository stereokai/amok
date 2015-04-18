var amok = require('../');
var test = require('tape');

test('open chrome', function(t) {
  var options = {
    client: 'chrome',
    url: 'about:blank'
  };

  var client = amok.open(options, function() {
    t.ok(client.pid);
    client.kill();
  });

  client.on('close', function(code) {
    t.equal(code, 0);
    t.end();
  });
});
