var web = require('browser_process');
var util = require('util');
var rdbg = require('rdbg');

var debug = util.debuglog('amok-browser');

function plugin(command, args, output) {
  if (typeof args === 'undefined') {
    args = [];
  } else {
    args = args.slice(0);
  }

  return function browser(client, runner, done) {
    var url = runner.get('url');
    var port = runner.get('port');

    args.unshift.apply(args, web.options(command, {
      url: url,
      debug: port,
    }));

    debug('spawn %s %s', command, args.join(' '));
    web.spawn(command, args, function (error, browser) {
      if (error) {
        debug('bail %s', error.description);
        return done(error);
      }

      if (output) {
        browser.stdout.pipe(output);
        browser.stderr.pipe(output);
      }

      runner.once('close', function kill() {
        debug('kill');
        browser.kill('SIGTERM');
      });

      debug('find %s', url);

      process.nextTick(function find() {
        rdbg.get(port, 'localhost', function (error, targets) {
          if (error) {
            return process.nextTick(find);
          }

          var target = targets.filter(function (target) {
            return url === target.url;
          })[0];

          if (!target) {
            return process.nextTick(find);
          }

          debug('ready');
          done();
        });
      });
    });
  };
}

module.exports = plugin;
