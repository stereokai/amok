var test = require('tape');
var child = require('child_process');
var util = require('util');

var bin = './bin/cmd.js';
var clients = [
  'chrome'
];

var variants = [
  ['test/fixture/plain.js'],
  ['--compiler', 'browserify', 'test/fixture/babel.js', '--', '--transform', 'babelify'],
];

clients.forEach(function(client) {
  var args = [
    '--client',
    client
  ];

  variants.forEach(function(variant) {
    var exeArgs = args.concat(variant);

    test(util.format('cli %s', exeArgs.join(' ')), function(t) {
      t.plan(1);

      var exe = child.spawn('node', [bin].concat(exeArgs));
      exe.stderr.on('data', function() {
        t.fail();
      });

      exe.stdout.once('data', function(data) {
        t.equal(data.toString(), 'ok\n');
        exe.kill();
      });
    });
  });
});
