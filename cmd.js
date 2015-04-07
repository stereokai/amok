#!/usr/bin/env node

var amok = require('./');
var async = require('async');

var fs = require('fs');
var path = require('path');
var temp = require('temp');
var repl = require('repl');
var util = require('util');

var bole = require('bole');
var bistre = require('bistre');

function program(callback, data) {
  var cmd = require('commander');
  var pkg = require('./package.json');

  cmd.usage('[options] <script>');
  cmd.version(pkg.version);

  cmd.option('--host <HOST>', 'specify http host', 'localhost');
  cmd.option('--port <PORT>', 'specify http port', 9966);

  cmd.option('--debugger-host <HOST>', 'specify debugger host', 'localhost');
  cmd.option('--debugger-port <PORT>', 'specify debugger port', 9222);

  cmd.option('-i, --interactive', 'enable interactive mode');

  cmd.option('--client <CMD>', 'specify the client to spawn');
  cmd.option('--compiler <CMD>', 'specify the compiler to spawn');

  cmd.option('-v, --verbose', 'enable verbose logging mode');

  cmd.parse(process.argv);
  cmd.cwd = process.cwd();

  if (cmd.args.length < 1) {
    cmd.help();
  }

  var scripts = cmd.args.filter(function(arg) {
    return path.extname(arg);
  });

  cmd.scripts = scripts.reduce(function(object, value, key) {
    object[value] = path.resolve(value);
    return object;
  }, {});

  var transform = bistre.createStream();
  transform.pipe(process.stdout);

  bole.output({
    level: cmd.verbose ? 'info' : 'error',
    stream: transform
  });

  callback(null, cmd);
}

function compiler(callback, data) {
  var log = bole('compile');

  if (data.program.compiler === undefined) {
    log.info('skip');
    return callback(null, null);
  }

  log.info('spawn');

  var compiler = amok.compile(data.program, function(error, stdout, stderr) {
    if (error) {
      return callback(error);
    }

    log.info('ok', { pid: compiler.pid });

    stdout.on('data', function(data) {
      log.info(data.toString());
    });

    stdout.on('data', function(data) {
      log.error(data.toString());
    });

    data.program.scripts = {
      'bundle.js': compiler.output,
    };

    callback(null, compiler);
  });
}

function watcher(callback, data) {
  var log = bole('watch');

  log.info('start');
  var watcher = amok.watch(data.program, function() {
    log.info('ok');

    watcher.on('change', function(filename) {
      log.info('change', { filename: filename });

      var script = Object.keys(data.program.scripts)
        .filter(function(key) {
          return data.program.scripts[key] === filename
        })[0];

      if (script) {
        log.info('re-compile', { filename: filename });

        fs.readFile(filename, 'utf-8', function(error, contents) {
          if (error) {
            log.error(error);
          }

          data.bugger.source(script, contents, function(error) {
            if (error) {
              return log.error(error);
            }

            log.info('ok');
          });
        });
      }
    });

    callback(null, watcher);
  });
}

function server(callback, data) {
  var log = bole('http');
  log.info('starting');

  var server = amok.serve(data.program, function() {
    var address = server.address();
    log.info('listening', { host: address.address, port: address.port });

    callback(null, server);
  });
}

function client(callback, data) {
  var log = bole('client');

  if (data.program.client === undefined) {
    log('skip');
    return callback(null, null);
  }

  log.info('spawn');
  var client = amok.open(data.program, function(error, stdout, stderr) {
    if (error) {
      return callback(error);
    }

    log.info('ok', { pid: client.pid });

    stdout.on('data', function(data) {
      log.info(data.toString());
    });

    stderr.on('data', function(data) {
      log.warn(data.toString());
    });

    callback(null, client);
  });
}

function bugger(callback, data) {
  var log = bole('debugger');

  log.info('connect');

  var bugger = amok.debug(data.program, function(error, target) {
    if (error) {
      return callback(error);
    }

    log.info('attach', { url: target.url, title: target.title });

    bugger.console.on('data', function(message) {
      if (message.parameters) {
        var parameters = message.parameters.map(function(parameter) {
          return parameter.value;
        });

        if (console[message.level]) {
          console[message.level].apply(console, parameters);
        }
      }
    });

    callback(null, bugger);
  });
}

function prompt(callback, data) {
  if (data.program.interactive === undefined) {
    return callback(null, null);
  }

  var options = {
    prompt: '> ',
    input: process.stdin,
    output: process.stdout,
    writer: function(result) {
      if (result.value) {
        return util.inspect(result.value, {
          colors: true,
        });
      } else if (result.objectId) {
        return util.format('[class %s]\n%s', result.className, result.description);
      }
    },

    eval: function(cmd, context, filename, write) {
      data.bugger.evaluate(data.program, function(error, result) {
        write(error, result);
      });
    },
  };

  var prompt = repl.start(options);
  callback(null, prompt);
}

async.auto({
  'program': [program],
  'compiler': ['program', compiler],
  'server': ['program', 'compiler', server],
  'client': ['program', 'server', client],
  'bugger': ['program', 'client', bugger],
  'watcher': ['program', 'bugger', watcher],
  'prompt': ['program', 'bugger', prompt],
}, function(error, data) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});
