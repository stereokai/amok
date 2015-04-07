#!/usr/bin/env node

var amok = require('./');
var async = require('async');

var fs = require('fs');
var path = require('path');
var temp = require('temp');
var repl = require('repl');
var util = require('util');

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

  cmd.scripts = cmd.args.reduce(function(object, value, key) {
    object[value] = path.resolve(value);
    return object;
  }, {});

  callback(null, cmd);
}

function compiler(callback, data) {
  if (data.program.compiler === undefined) {
    return callback(null, null);
  }

  if (data.program.verbose) {
    console.info('Spawning compiler...');
  }

  var compiler = amok.compile(data.program, function(error, stdout, stderr) {
    if (error) {
      return callback(error);
    }

    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);

    data.program.scripts = {
      'bundle.js': compiler.output,
    };

    callback(null, compiler);
  });
}

function watcher(callback, data) {
  var watcher = amok.watch(data.program, function() {
    if (data.program.verbose) {
      console.info('File watcher ready');
    }

    watcher.on('change', function(filename) {
      if (data.program.verbose) {
        console.info(filename, 'changed');
      }

      var script = Object.keys(data.program.scripts)
        .filter(function(key) {
          return data.program.scripts[key] === filename
        })[0];

      if (script) {
        if (data.program.verbose) {
          console.info('Re-compiling', script, '...');
        }

        fs.readFile(filename, 'utf-8', function(error, contents) {
          if (error) {
            return console.error(error);
          }

          data.bugger.source(script, contents, function(error) {
            if (error) {
              return console.error(error);
            }

            if (data.program.verbose) {
              console.info('Re-compilation succesful');
            }
          });
        });
      }
    });

    callback(null, watcher);
  });
}

function server(callback, data) {
  if (data.program.verbose) {
    console.info('Starting server...');
  }

  var server = amok.serve(data.program, function() {
    var address = server.address();
    if (data.program.verbose) {
      console.info('Server listening on http://%s:%d', address.address,
        address.port);
    }

    callback(null, server);
  });
}

function client(callback, data) {
  if (data.program.client === undefined) {
    return callback(null, null);
  }

  if (data.program.verbose) {
    console.log('Spawning client...');
  }

  var client = amok.open(data.program, function(error, stdout, stderr) {
    if (error) {
      return callback(error);
    }

    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);

    callback(null, client);
  });
}

function bugger(callback, data) {
  if (data.program.verbose) {
    console.info('Attaching debugger...');
  }

  var bugger = amok.debug(data.program, function(error, target) {
    if (error) {
      return callback(error);
    }

    if (data.program.verbose) {
      console.info('Debugger attached to', target.title);
    }

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
