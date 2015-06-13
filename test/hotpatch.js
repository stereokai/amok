const amok = require('..');
const fs = require('fs');
const http = require('http');
const test = require('tape');
const url = require('url');
const path = require('path');

const browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function(browser, index) {
  test('hot patch script in ' + browser, function(test) {
    test.plan(13);

    var runner = amok.createRunner();
    runner.on('close', function() {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-basic/index.html')));
    runner.set('port', 4000 + index);

    runner.use(amok.browser(browser));
    runner.use(amok.hotpatch('test/fixture/hotpatch-basic/*.js'));

    runner.connect(runner.get('port'), 'localhost', function() {
      test.pass('connect');

      var values = [
        'step-0',
        'step-1',
        'step-2',
        'step-3',
        'step-4',
        'step-5',
        'step-6',
        'step-7',
        'step-8',
        'step-9',
        'step-0',
      ];

      var source = fs.readFileSync('test/fixture/hotpatch-basic/index.js', 'utf-8');
      runner.inspector.console.on('data', function(message) {
        test.equal(message.text, values.shift(), message.text);

        if (values.length === 0) {
          return runner.close();
        }

        setTimeout(function() {
          source = source.replace(message.text, values[0]);
          fs.writeFileSync('test/fixture/hotpatch-basic/index.js', source, 'utf-8');
        }, 50);
      });
    });
  });
});

browsers.forEach(function(browser, index) {
  test('hot patch events in ' + browser, function(test) {
    test.plan(3);

    var runner = amok.createRunner();
    runner.on('close', function() {
      test.pass('close');
    });

    runner.set('cwd', 'test/fixture/hotpatch-events');
    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-events/index.html')));
    runner.set('port', 4000 + index);

    runner.use(amok.browser(browser));
    runner.use(amok.hotpatch('test/fixture/hotpatch-events/*.js'));

    runner.connect(runner.get('port'), 'localhost', function() {
      test.pass('connect');

      runner.inspector.console.on('data', function(message) {
        test.equal(message.text, 'patch index.js');
        runner.close();
      });

      var source = fs.readFileSync('test/fixture/hotpatch-events/index.js', 'utf-8');
      fs.writeFileSync('test/fixture/hotpatch-events/index.js', source, 'utf-8');
    });
  });
});
