#!/usr/bin/env node

var amok = require('./');
var async = require('async');

var fs = require('fs');
var path = require('path');
var repl = require('repl');
var util = require('util');

var bole = require('bole');
var bistre = require('bistre');

function program(callback, data) {
  var cmd = require('commander');
  var pkg = require('./package.json');

  cmd.usage('[options] <script | url>');
  cmd.version(pkg.version);

  cmd.option('--host <HOST>', 'specify http host', 'localhost');
  cmd.option('--port <PORT>', 'specify http port', 9966);

  cmd.option('--debugger-host <HOST>', 'specify debugger host', 'localhost');
  cmd.option('--debugger-port <PORT>', 'specify debugger port', 9222);

  cmd.option('-i, --interactive', 'enable interactive mode');
  cmd.option('-w, --watch <GLOB>', 'specify watch pattern', process.cwd());

  cmd.option('--client <CMD>', 'specify the client to spawn');
  cmd.option('--compiler <CMD>', 'specify the compiler to spawn');

  cmd.option('-v, --verbose', 'enable verbose logging mode');

  cmd.parse(process.argv);
  cmd.cwd = process.cwd();

  if (cmd.args.length < 1) {
    cmd.help();
  }

  var scripts = cmd.args.filter(function(arg) {
    return arg.match(/[^\\/]+$/);
  });

  var url = cmd.args.filter(function(arg) {
    return arg.match(/^(http|https):\/\//);
  }).pop();

  cmd.scripts = scripts.reduce(function(object, value, key) {
    object[value] = path.resolve(value);
    return object;
  }, {});

  cmd.url = url;

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

    data.program.scripts = {
      'bundle.js': compiler.output,
    };

    callback(null, compiler);
  });

  compiler.stdout.on('data', function(data) {
    log.info(data.toString());
  });

  compiler.stderr.on('data', function(data) {
    log.error(data.toString());
  });
}

function watcher(callback, data) {
  var log = bole('watch');

  log.info('start');
  var watcher = amok.watch(data.program, function() {
    log.info('ok');

    callback(null, watcher);
  });

  var emit = function(event, filename) {
    filename = path.relative(process.cwd(), filename);

    var source = 'if (typeof(window) !== \'undefined\') {'
               + '  var e = new CustomEvent(\''+ event + '\','
               + '    { detail: \'' + filename +'\' });'
               + ''
               + '  window.dispatchEvent(e);'
               + '}';
               + ''
               + 'if (typeof(process) !== \'undefined\') {'
               + '  process.emit(\'' + event + '\', \'' + filename + '\');'
               + '}';

    data.bugger.evaluate(source, function(error, result) {
      if (error) {
        log.error(error);
      }
    });
  };

  watcher.on('add', function(filename) {
    log.info('add', { filename: filename });
    emit('add', filename);
  });

  watcher.on('unlink', function(filename) {
    log.info('remove', { filename: filename });
    emit('remove', filename);
  });

  watcher.on('change', function(filename) {
    log.info('change', { filename: filename });
    emit('change', filename);

    var script = Object.keys(data.program.scripts).filter(function(key) {
      return data.program.scripts[key] === filename;
    }).pop();

    if (script == undefined) {
      var scripts = data.bugger._scripts.map(function(obj) {
        return path.basename(obj.url);
      });

      script = scripts.filter(function(basename) {
        return path.resolve(basename) == filename;
      })[0];
    }

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
          emit('source', filename);
        });
      });
    }
  });

  watcher.on('error', function(error) {
    log.error(error);
    process.exit(error.errno);
  });
}

function server(callback, data) {
  var log = bole('http');

  if (data.program.url) {
    log.info('skip');
    return callback(null, null);
  }

  log.info('starting');

  var server = amok.serve(data.program, function() {
    var address = server.address();
    log.info('listening', { host: address.address, port: address.port });

    data.program.url = util.format('http://%s:%d', data.program.host, data.program.port);
    callback(null, server);
  });

  server.on('request', function(request, response) {
    log.info(request);
  });

  server.on('error', function(error) {
    log.error(error);
    process.exit(error.errno);
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
    callback(null, client);
  });

  client.on('error', function(error) {
    log.error(error);
    process.exit(error.errno);
  });

  client.stdout.on('data', function(data) {
    log.info(data.toString());
  });

  client.stderr.on('data', function(data) {
    log.warn(data.toString());
  });
}

function bugger(callback, data) {
  var log = bole('debugger');

  log.info('connect');

  var bugger = amok.debug(data.program, function(error, target) {
    if (error) {
      return callback(error);
    }

    callback(null, bugger);
  });

  bugger.on('attach', function(target) {
    log.info('attach', { url: target.url, title: target.title });
  });

  bugger.on('detatch', function() {
    log.warn('detatch');
  });

  bugger.on('error', function(error) {
    log.error(error);
    process.exit(error.errno);
  });

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
