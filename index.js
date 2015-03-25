var http = require('http');
var util = require('util');
var child = require('child_process');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var chokidar = require('chokidar');
var rdbg = require('rdbg');

function serve(options, callback) {
  var server = http.createServer(function(request, response) {
    if (request.url == '/') {
      response.setHeader('content-type', 'text/html');
      response.write('<!doctype html><head><meta charset="utf-8"></head><body>');

      for (var key in options.scripts) {
        response.write('<script src="' + key + '"></script>');
      }

      response.end('</body>');
    } else {
      var filename = options.scripts[path.basename(request.url)];
      if (!filename) {
        var filename = path.join(options.cwd, request.url);
      }

      fs.exists(filename, function(exists) {
        if (exists) {
          response.setHeader('content-type', mime.lookup(filename));
          response.writeHead(200);

          var file = fs.createReadStream(filename);
          file.pipe(response);
        } else {
          response.writeHead(404);
          response.end('404');
        }
      });
    }
  });

  server.listen(options.port, options.host, callback);
  return server;
}

function bundle(options, callback) {
  var args = options.bundler.split(' ');
  var cmd = args.shift();

  args = args.concat(options.args);

  var bundler = child.spawn(cmd, args);
  console.log(args);

  process.nextTick(function() {
    callback(null, bundler.stdout, bundler.stderr);
  });

  return bundler;
}

function watch(options, callback) {
  var files = Object.keys(options.scripts).map(function(key) {
    return path.dirname(options.scripts[key]);
  });

  var watcher = chokidar.watch(files, {
    persistent: true
  });

  if (callback) {
    watcher.once('ready', callback);
  }

  return watcher;
}

function debug(options, callback) {
  var bugger = rdbg.connect(options.debuggerPort, options.debuggerHost, function(targets) {
    bugger.on('detatch', function() {
      var id = setInterval(function() {
        bugger.targets(function(targets) {
          if (targets == undefined) {
            targets = [];
          }

          var target = targets.filter(function(target) {
            return target.url.indexOf(options.host) > -1;
          })[0];

          if (target && target.webSocketDebuggerUrl) {
            bugger.attach(target);
          }
        });
      }, 500);

      bugger.once('attach', function() {
        clearInterval(id);
      });
    });

    var id = setInterval(function() {
      var target = targets.filter(function(target) {
        return target.url.indexOf(options.host) > -1 && target.webSocketDebuggerUrl;
      })[0];

      if (target) {
        bugger.attach(target, callback);
        clearInterval(id);
      }
    }, 250);
  });

  return bugger;
}

function browse(options, callback) {
  var args = options.browser.split(' ');
  var cmd = args.shift();

  var url = util.format('http://%s:%d', options.host, options.port);
  args.push(url);

  var browser = child.spawn(cmd, args);

  process.nextTick(function() {
    callback(null, browser.stdout, browser.stderr);
  });

  return browser;
}

module.exports.serve = serve;
module.exports.watch = watch;
module.exports.bundle = bundle;
module.exports.debug = debug;
module.exports.browse = browse;
