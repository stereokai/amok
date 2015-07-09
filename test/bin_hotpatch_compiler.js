var child = require('child_process');
var http = require('http');
var test = require('tape');
var fs = require('fs');
var path = require('path');
var url = require('url');

var bin = require('../package.json').bin['amok'];

var browsers = [
  'chrome',
  'chromium',
];

var compilers = [
  'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack',
];

browsers.forEach(function (browser) {
  compilers.forEach(function (compiler, index) {
    test('bin hot patch basic compiled with ' + compiler + ' in ' + browser, function (test) {
      test.plan(13);

      var dirname = 'test/fixture/hotpatch-' + compiler;
      var entries = fs.readdirSync(dirname).map(function (filename) {
        return path.join(dirname, filename);
      }).filter(function (filename) {
        return filename.match(/(.js|.ts|.coffee)$/);
      });

      var args = [
        bin,
        '--port',
        9966 + index,
        '--hot',
        '--compiler',
        compiler,
        '--browser',
        browser,
        entries[0]
      ];

      test.comment(args.join(' '));

      var cli = child.spawn('node', args);
      cli.stderr.pipe(process.stderr);

      cli.on('close', function () {
        test.pass('close');
      });

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
      cli.stdout.setEncoding('utf-8');
      cli.stdout.on('data', function (chunk) {
        chunk.split('\n').forEach(function (line) {
          if (line === '') {
            return;
          }

          test.equal(line, values.shift(), line);

          if (values[0] === undefined) {
            cli.kill('SIGTERM')
          } else if (line.match(/step/)) {
            source = source.replace(line, values[0]);

            setTimeout(function () {
              fs.writeFileSync(entries[0], source, 'utf-8');
            }, 1000);
          }
        });
      });
    });
  });
});