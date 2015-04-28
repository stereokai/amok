#!/usr/bin/env node

var amok = require('../');
var async = require('async');

var fs = require('fs');
var path = require('path');
var repl = require('repl');
var util = require('util');
var url = require('url');

var bole = require('bole');
var bistre = require('bistre');

var program = require('commander');
var package = require('../package.json');

program.usage('[options] <script | url>');
program.version(package.version);

program.option('-s, --debugger-host <HOST>', 'specify debugger host', 'localhost');
program.option('-r, --debugger-port <PORT>', 'specify debugger port', 9222);
program.option('-b, --browser <BROWSER>', 'specify browser');
program.option('-c, --compiler <COMPILER>', 'specify compiler');
program.option('-a, --host <HOST>', 'specify http host', 'localhost');
program.option('-p, --port <PORT>', 'specify http port', 9966);
program.option('-w, --watch <GLOB>', 'specify watch pattern', null);
program.option('-i, --interactive', 'enable interactive mode');
program.option('-v, --verbose', 'enable verbose mode');

program.parse(process.argv);
program.cwd = process.cwd();

if (program.args.length < 1) {
  program.help();
}

var scripts = program.args.filter(function(arg) {
  return arg.match(/[^\\/]+$/);
});

var url = program.args.filter(function(arg) {
  return arg.match(/^(http|https):\/\//);
}).pop();

program.scripts = scripts.reduce(function(object, value, key) {
  object[path.resolve(value)] = value;
  return object;
}, {});

program.url = url;

var transform = bistre.createStream();
transform.pipe(process.stderr);

bole.output({
  level: program.verbose ? 'debug' : 'error',
  stream: transform
});

async.auto({
  compiler: function(callback, data) {
    if (program.compiler === undefined) {
      return callback(null, null);
    }

    var log = bole('compiler');
    log.info('spawn');

    var compiler = amok.compile(program.compiler, program.args, program);
    compiler.on('ready', function(scripts) {
      log.info('ok', { pid: compiler.pid });

      program.scripts = scripts;
      callback(null, compiler);
    });

    compiler.stdout.on('data', function(data) {
      log.info(data.toString());
    });

    compiler.stderr.on('data', function(data) {
      log.error(data.toString());
    });

    process.on('exit', function() {
      compiler.kill('SIGTERM');
    });
  },
  debugger: ['browser', 'watcher', function(callback, data) {
    var log = bole('debugger');
    log.info('connect');

    program.watcher = data.watcher;
    var bugger = amok.debug(program, function() {
      callback(null, bugger);
    });

    bugger.on('source', function(script) {
      log.info('source', { url: script.url });
    });

    bugger.on('attach', function(target) {
      log.info('attach', { url: target.url, title: target.title });
    });

    bugger.on('detatch', function() {
      log.warn('detatch');
    });

    bugger.on('error', function(error) {
      log.error(error);
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
  }],

  browser: ['server', function(callback, data) {
    var log = bole('browser');

    if (program.browser === undefined) {
      log('skip');
      return callback(null, null);
    }

    log.info('spawn');
    var browser = amok.browse(program.browser, [program.url], program);
    browser.on('ready', function() {
      log.info('ok', { pid: browser.pid });
      callback(null, browser);
    });

    browser.on('error', function(error) {
      log.error(error);
      process.exit(error.errno);
    });

    browser.stdout.on('data', function(data) {
      log.info(data.toString());
    });

    browser.stderr.on('data', function(data) {
      log.warn(data.toString());
    });

    process.on('exit', function() {
      browser.kill('SIGTERM');
    });
  }],

  server: ['compiler', function(callback, data) {
    var log = bole('http');

    if (program.url) {
      log.info('skip');
      return callback(null, null);
    }

    log.info('starting');

    var server = amok.serve(program.port, program.host, program);
    server.on('listening', function() {
      var address = server.address();
      log.info('listening', { host: address.address, port: address.port });

      program.url = util.format('http://%s:%d', program.host, program.port);
      callback(null, server);
    });

    server.on('request', function(request, response) {
      log.info(request);
    });

    server.on('error', function(error) {
      log.error(error);
    });
  }],

  watcher: ['compiler', function(callback, data) {
    var log = bole('watch');

    log.info('start');

    var patterns = [];
    if (program.watch) {
      patterns.push(program.watch);
    }

    var filenames = Object.keys(program.scripts);
    if (filenames.length > 0) {
      patterns.push(path.dirname(filenames[0]));
    }

    var watcher = amok.watch(patterns);
    watcher.on('ready', function() {
      log.info('ok');
      callback(null, watcher);
    });

    watcher.on('add', function(filename) {
      log.info('add', { filename: filename });
    });

    watcher.on('unlink', function(filename) {
      log.info('remove', { filename: filename, pathname: filename });
    });

    watcher.on('change', function(filename) {
      log.info('change', { filename: filename });
    });

    watcher.on('error', function(error) {
      log.error(error);
    });
  }],
});

process.on('SIGTERM', function() {
  process.exit(0);
});

process.on('SIGINT', function() {
  process.exit(0);
});
