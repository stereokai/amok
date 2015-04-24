var amok = require('../');
var test = require('tape');

test('open chrome', function(t) {
  var options = {
  };

  var client = amok.open('chrome', ['about:blank'], options, function() {
    t.ok(client.pid);
    client.kill();
  });

  client.on('close', function(code) {
    t.equal(code, 0);
    t.end();
  });
});
