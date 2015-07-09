var amok = require('..');
var test = require('tape');
var url = require('url');
var path = require('path');

var commands = [
  'chrome',
  'chromium',
];

commands.forEach(function (command, index) {
  test('open url in ' + command, function (test) {
    test.plan(3);

    var runner = amok.createRunner();
    runner.on('close', function () {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')));
    runner.set('port', 4000 + index);

    runner.use(amok.browser(command));
    runner.connect(runner.get('port'), 'localhost', function () {
      runner.client.console.on('data', function (message) {
        test.equal(message.text, 'ready');

        setTimeout(function () {
          runner.close();
        }, 100);
      });

      runner.client.console.enable(function (error) {
        test.error(error);
      });
    });
  });
});
