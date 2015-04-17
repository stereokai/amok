var test = require('tape');
var child = require('child_process');

var bin = './bin/cmd.js';
test('amok --client chrome fixture/console.js', function(t) {
  t.plan(1);

  var exe = child.spawn('node', [bin, '--client', 'chrome', 'test/fixture/console.js']);
  exe.stdout.once('data', function(data) {
    t.equal(data.toString(), 'ok\n');
    exe.kill();
  });
});
