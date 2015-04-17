var child = require('child_process');
var chokidar = require('chokidar');
var fs = require('fs');
var http = require('http');
var mime = require('mime');
var path = require('path');
var rdbg = require('rdbg');
var temp = require('temp');
var url = require('url');
var util = require('util');
var which = require('which');

function serve(options, callback) {
  var server = http.createServer();

  var scripts = options.scripts || {};
  var cwd = options.cwd | process.cwd()

  server.on('request', function(request, response) {
    if (request.url === '/') {
      request.url = '/index.html';
    }

    var location = url.parse(request.url);
    var filename = path.join(options.cwd, location.pathname);

    for (var name in scripts) {
      if (scripts.hasOwnProperty(name)) {
        if (scripts[name] === path.relative('/', location.pathname)) {
          filename = name;
          break;
        }
      }
    }

    fs.exists(filename, function(exists) {
      if (exists) {
        response.setHeader('content-type', mime.lookup(filename));
        response.writeHead(200);

        var file = fs.createReadStream(filename);
        file.pipe(response);
      } else if (path.basename(filename) === 'index.html') {
        response.setHeader('content-type', 'text/html');
        response.write('<!doctype html><head><meta charset="utf-8"></head><body>');

        for (var name in scripts) {
          if (scripts.hasOwnProperty(name)) {
            response.write('<script src="' + scripts[name] + '"></script>');
          }
        }

        response.end('</body>');
      } else {
        response.writeHead(404);
        response.end('404');
      }
    });
  });

  server.listen(options.port, options.host, callback);
  return server;
}

function compile(options, callback) {
  var dirpath = temp.mkdirSync('amok-output');
  options.output = path.join(dirpath, path.basename(options.args[0].replace(/\.[^\.]+$/, '.js')));

  var args = options.compiler.match(/'[^"]*'|"[^"]*"|\S+/g);
  var command = args.shift();

  switch (options.compiler) {
    case 'browserify':
      command = which.sync('watchify');
      args = [
        '-o',
        options.output,
      ];
      break;

    case 'webpack':
      command = which.sync('webpack');
      args = [
        '--watch',
        '--output-file',
        options.output,
      ];
      break;

    case 'typescript':
      command = which.sync('tsc');
      args = [
        '--watch',
        '--out',
        options.output,
      ];
      break;

    case 'coffeescript':
      command = which.sync('coffee');
      args = [
        '--watch',
        '--compile',
        '--output',
        dirpath,
      ];
      break;

    case 'babel':
      command = which.sync('babel');
      args = [
        '--watch',
        '--out-file',
        options.output,
      ];
      break;
  }

  args = args.concat(options.args);

  var compiler = child.spawn(command, args);
  compiler.output = options.output;

  process.nextTick(function tick() {
    fs.exists(compiler.output, function(exists) {
      if (exists) {
        callback(null, compiler.stdout, compiler.stderr);
      } else {
        setTimeout(tick, 100);
      }
    });
  });

  return compiler;
}

function watch(options, callback) {
  var scripts = options.scripts || {};
  var cwd = options.cwd || process.cwd();

  var watcher = chokidar.watch(options.watch, {
    persistent: true
  });

  for (var name in scripts) {
    if (scripts.hasOwnProperty(name)) {
      var dirname = path.dirname(name);
      watcher.add(dirname);
    }
  }

  var bugger = options.bugger;
  if (bugger) {
    var resolve = function(filename) {
      if (scripts[filename]) {
        return scripts[filename];
      }

      return path.relative(cwd, filename);
    };

    var emit = function(event, filename) {
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

      bugger.evaluate(source, function(error, result) {
        if (error) {
          bugger.emit('error', error);
        }
      });
    };

    watcher.on('add', function(filename) {
      var pathname = resolve(filename);
      emit('add', pathname);
    });

    watcher.on('remove', function(filename) {
      var pathname = resolve(filename);
      emit('remove', pathname);
    });

    watcher.on('change', function(filename) {
      var pathname = resolve(filename);
      emit('change', filename);

      bugger.scripts(function(scripts) {
        var script = scripts.filter(function(script) {
          var location = url.parse(script.url);
          return path.relative('/', location.path || '') === pathname;
        })[0];

        if (script === undefined) {
          return;
        }

        fs.readFile(filename, 'utf-8', function(error, contents) {
          if (error) {
            return bugger.emit('error', error);
          }

          bugger.source(script, contents);
        });
      });
    });

    bugger.on('source', function(script) {
      var location = url.parse(script.url);
      var pathname = path.relative('/', location.pathname || '');
      emit('source', pathname);
    });
  }

  if (callback) {
    watcher.once('ready', callback);
  }

  return watcher;
}

function debug(options, callback) {
  var bugger = rdbg.connect(options.debuggerPort, options.debuggerHost);

  var reattach = function() {
    bugger.targets(function(targets) {
      var target = targets.filter(function(target) {
        return target.url.search(options.url) > -1 && target.webSocketDebuggerUrl;
      })[0];

      if (target !== undefined) {
        bugger.attach(target);
      } else {
        setTimeout(autoconnect, 250);
      }
    });
  };

  if (callback) {
    bugger.on('attach', callback);
  }

  bugger.on('detatch', reattach);
  process.nextTick(reattach);

  return bugger;
}

function open(options, callback) {
  var clients = {
    chrome: function chrome(options) {
      var command = (function() {
        switch (process.platform) {
        case 'win32':
          var suffix = '\\Google\\Chrome\\Application\\chrome.exe';
          var prefixes = [
            process.env['LOCALAPPDATA'],
            process.env['PROGRAMFILES'],
            process.env['PROGRAMFILES(X86)'],
          ];

          var executables = prefixes.map(function(prefix) {
            return prefix + suffix;
          }).filter(function(path) {
            return fs.existsSync(path);
          });

          return executables[0];

        case 'darwin':
          return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

        default:
          return which.sync('google-chrome');
        }
      }());

      var args = [
        '--remote-debugging-port=' + options.debuggerPort,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-translate',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-zero-browsers-open-for-tests',
        '--user-data-dir=' + temp.mkdirSync('amok-chrome'),
      ];

      args.push(options.url);

      return { command: command, args: args };
    },
  };

  var client = null;
  if (clients[options.client]) {
    client = clients[options.client].call(null, options);
  } else {
    var args = options.match(/'[^"]*'|"[^"]*"|\S+/g);
    var command = args.shift();

    args.push(options.url);

    client = {
      args: args,
      command: command
    };
  }

  var exe = child.spawn(client.command, client.args);

  setTimeout(function() {
    callback(null, exe);
  }, 1000);

  return exe;
}

module.exports.serve = serve;
module.exports.watch = watch;
module.exports.compile = compile;
module.exports.debug = debug;
module.exports.open = open;
