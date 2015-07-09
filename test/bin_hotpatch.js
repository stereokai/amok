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

browsers.forEach(function (browser) {
  var entries = [
    'test/fixture/hotpatch-basic/index.js',
    url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-basic/index.html'))
  ];

  entries.forEach(function (entry) {
    var args = [
      bin,
      '--hot',
      '--browser',
      browser,
      entry
    ];

    test(args.join(' '), function (test) {
      test.plan(23);

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

      var source = fs.readFileSync('test/fixture/hotpatch-basic/index.js', 'utf-8');
      cli.stdout.setEncoding('utf-8');
      cli.stdout.on('data', function (chunk) {
        chunk.split('\n').forEach(function (line) {
          if (line.length === 0) {
            return;
          }

          test.comment(line);
          test.equal(line, values.shift(), line);

          if (values[0] === undefined) {
            cli.kill('SIGTERM')
          } else if (line.match(/^step/)) {
            source = source.replace(line, values[0]);

            fs.writeFile('test/fixture/hotpatch-basic/index.js', source, 'utf-8', function (error) {
              test.error(error);
            });
          }
        });
      });
    });
  });
});