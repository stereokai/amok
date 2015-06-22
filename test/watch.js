const amok = require('..');
const fs = require('fs');
const test = require('tape');
const url = require('url');
const path = require('path');

const browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function(browser, index) {
  test('watch events in ' + browser, function(test) {
    test.plan(7);

    var runner = amok.createRunner();
    runner.on('close', function() {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/watch-events/index.html')));
    runner.set('port', 4000 + index);

    runner.set('cwd', 'test/fixture/watch-events');
    runner.use(amok.browser(browser));
    runner.use(amok.watch('*.txt'));

    runner.connect(runner.get('port'), 'localhost', function() {
      test.pass('connect');

      var values = [
        'ready',
        'add file.txt',
        'change file.txt',
        'unlink file.txt'
      ];

      runner.client.console.on('data', function(message) {
        test.equal(message.text, values.shift(), message.text);

        if (values[0] === undefined) {
          runner.close();
        } if (message.text === 'ready') {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello', 'utf-8');
        } else if (message.text === 'add file.txt') {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello world', 'utf-8');
        } else if (message.text === 'change file.txt') {
          fs.unlinkSync('test/fixture/watch-events/file.txt');
        }
      });

      runner.client.console.enable(function(error) {
        test.error(error);
      });
    });
  });
});
