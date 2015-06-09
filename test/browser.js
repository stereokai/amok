const amok = require('..');
const test = require('tape');
const url = require('url');
const path = require('path');

const commands = [
  'chrome',
  'chromium',
];

commands.forEach(function(command, index) {
  test('open url in ' + command, function(test) {
    test.plan(5);

    var runner = amok.createRunner();
    runner.on('close', function() {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')));
    runner.set('port', 4000 + index);

    runner.use(amok.browser(command));
    runner.connect(runner.get('port'), 'localhost', function(error, inspector, runner) {
      test.error(error);
      test.ok(inspector);
      test.ok(runner);

      inspector.console.on('data', function(message) {
        test.equal(message.text, 'ready');
        runner.close();
      });
    });
  });
});
