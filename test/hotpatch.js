var amok = require('..');
var fs = require('fs');
var http = require('http');
var test = require('tape');
var url = require('url');
var path = require('path');

var browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function (browser, index) {
  test('hot patch basic script in ' + browser, function (test) {
    test.plan(35);

    var runner = amok.createRunner();
    runner.on('close', function () {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-basic/index.html')));
    runner.set('port', 4000 + index);

    runner.use(amok.browser(browser));
    runner.use(amok.hotpatch('test/fixture/hotpatch-basic/*.js'));

    runner.connect(runner.get('port'), 'localhost', function () {
      test.pass('connect');

      var values = [
        'ready',
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

      runner.client.console.on('data', function (message) {
        test.equal(message.text, values.shift(), message.text);

        if (values[0] === undefined) {
          runner.close();
        } else if (message.text.match(/step/)) {
          source = source.replace(message.text, values[0]);
          test.notEqual(source, fs.readFileSync('test/fixture/hotpatch-basic/index.js'));

          setTimeout(function () {
            fs.writeFile('test/fixture/hotpatch-basic/index.js', source, 'utf-8', function (error) {
              test.error(error);
            });
          }, 1000);
        }
      });

      runner.client.console.enable(function (error) {
        test.error(error);
      });
    });
  });
});

browsers.forEach(function (browser, index) {
  var compilers = [
    'babel',
    'coffee',
    'tsc',
    'watchify',
    'webpack',
  ];

  compilers.forEach(function (compiler) {
    test('hot patch basic script compiled with ' + compiler + ' in ' + browser, function (test) {
      test.plan(35);

      var dirname = 'test/fixture/hotpatch-' + compiler;
      var entries = fs.readdirSync(dirname).map(function (filename) {
        return path.join(dirname, filename);
      }).filter(function (filename) {
        return filename.match(/(.js|.ts|.coffee)$/);
      });

      var runner = amok.createRunner();
      runner.on('close', function () {
        test.pass('close');
      });

      runner.set('port', 4000 + index);

      runner.use(amok.server(9966, 'localhost'));
      runner.use(amok.compiler(compiler, entries, process.stderr));

      runner.use(amok.browser(browser));
      runner.use(amok.hotpatch());

      runner.connect(runner.get('port'), 'localhost', function () {
        test.pass('connect');

        var values = [
          'ready',
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

        var source = fs.readFileSync(entries[0], 'utf-8');

        runner.client.console.on('data', function (message) {
          test.equal(message.text, values.shift(), message.text);

          if (values[0] === undefined) {
            runner.close();
          } else if (message.text.match(/step/)) {
            source = source.replace(message.text, values[0]);
            test.notEqual(source, fs.readFileSync(entries[0]));

            setTimeout(function () {
              fs.writeFile(entries[0], source, 'utf-8', function (error) {
                test.error(error);
              });
            }, 1000);
          }
        });

        runner.client.console.enable(function (error) {
          test.error(error);
        });
      });
    });
  });
});

browsers.forEach(function (browser, index) {
  var compilers = [
    'babel',
    'coffee',
    'tsc',
    'watchify',
    'webpack',
  ];

  compilers.forEach(function (compiler) {
    test('hot patch growing script compiled with ' + compiler + ' in ' + browser, function (test) {
      test.plan(35);

      var dirname = 'test/fixture/hotpatch-' + compiler;
      var entries = fs.readdirSync(dirname).map(function (filename) {
        return path.join(dirname, filename);
      }).filter(function (filename) {
        return filename.match(/(.js|.ts|.coffee)$/);
      });

      var runner = amok.createRunner();
      var source = fs.readFileSync(entries[0], 'utf-8');
      var chunk = '';
      for (var i = 0; i < 5000; i++) {
        chunk += '\n' + source.split('\n')[0];
      }

      runner.on('close', function () {
        fs.writeFileSync(entries[0], source);
        test.pass('close');
      });

      runner.set('port', 4000 + index);

      runner.use(amok.server(9966, 'localhost'));
      runner.use(amok.compiler(compiler, entries, process.stderr));

      runner.use(amok.browser(browser));
      runner.use(amok.hotpatch());

      runner.connect(runner.get('port'), 'localhost', function () {
        test.pass('connect');

        var values = [
          'ready',
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
        runner.client.on('error', function(error) {
          test.fail(error.message);
        })
        var source = fs.readFileSync(entries[0], 'utf-8');

        runner.client.console.on('data', function (message) {
          test.equal(message.text, values.shift(), message.text);

          if (values[0] === undefined) {
            runner.close();
          } else if (message.text.match(/step/)) {
            source = source.replace(message.text, values[0]) + chunk;


            test.notEqual(source, fs.readFileSync(entries[0]));

            setTimeout(function () {
              fs.writeFile(entries[0], source, 'utf-8', function (error) {
                test.error(error);
              });
            }, 1000);
          }
        });

        runner.client.console.enable(function (error) {
          test.error(error);
        });
      });
    });
  });
});

browsers.forEach(function (browser, index) {
  test('hot patch events in ' + browser, function (test) {
    test.plan(6);

    var runner = amok.createRunner();
    runner.on('close', function () {
      test.pass('close');
    });

    runner.set('cwd', 'test/fixture/hotpatch-events');
    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-events/index.html')));
    runner.set('port', 4000 + index);

    runner.use(amok.browser(browser));
    runner.use(amok.hotpatch('test/fixture/hotpatch-events/*.js'));

    runner.connect(runner.get('port'), 'localhost', function () {
      test.pass('connect');

      var values = [
        'ready',
        'patch index.js',
      ];

      runner.client.console.on('data', function (message) {

        test.equal(message.text, values.shift());

        if (values[0] === undefined) {
          runner.close();
        } else if (message.text.match(/ready/)) {
          var source = fs.readFileSync('test/fixture/hotpatch-events/index.js', 'utf-8');
          setTimeout(function () {
            fs.writeFile('test/fixture/hotpatch-events/index.js', source, 'utf-8', function (error) {
              test.error(error);
            });
          }, 1000);
        }
      });

      runner.client.console.enable(function (error) {
        test.error(error);
      });
    });
  });
});
