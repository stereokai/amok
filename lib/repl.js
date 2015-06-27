var repls = require('repl');
var util = require('util');

var debug = util.debuglog('amok-repl');

function plugin(input, output, options) {
  if (typeof options === 'undefined') {
    options = {};
  }

  return function repl(client, runner, done) {
    debug('start');
    var repl = repls.start({
      input: input,
      output: output,
      useColors: options.useColors
    });

    repl.writer = function (output) {
      if (!output) {
        return '';
      }

      var result = output.result;

      if (result.value === 'null') {
        return util.inspect(null, { colors: repl.useColors });
      } else if (result.type === 'undefined') {
        return util.inspect(undefined, { colors: repl.useColors });
      } else if (result.value !== undefined) {
        return util.inspect(result.value, { colors: repl.useColors });
      } else if (result.type === 'function') {
        return '[Function]';
      } else if (result.type === 'object') {
        return '[Object]';
      }
    };

    repl.eval = function (cmd, context, filename, callback) {
      client.runtime.evaluate(cmd, callback);
    };

    repl.complete = function (line, callback) {
      callback([], line);
    };

    client.console.on('data', function (chunk) {
      repl.output.clearLine();
      repl.output.cursorTo(0);
      repl.output.write(chunk + '\n');
      repl.prompt(true);
    });

    client.on('attach', function () {
      client.runtime.enable(function (error) {
        if (error) {
          return client.emit('error');
        }

        debug('runtime');
      });
    });

    debug('ready');
    done();
  };
}

module.exports = plugin;
