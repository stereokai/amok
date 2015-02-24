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
        response.write('<script src="' +  key + '"></script>');
      }

      response.end('</body>');
    } else {
      var filename = options.scripts[path.basename(request.url)];
      if (!filename) {
        var filename = path.join(options.cwd, request.url);
      }

      console.log(filename);

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
  var cmd = util.format('%s %s', options.bundler, options.args.join(' '));
  return child.exec(cmd, callback);
}

function watch(options, callback) {
  var watcher = chokidar.watch(options.cwd, {
    ignored: '/[\/\\]\./', persistent: true
  });
  
  if (callback) {
    watcher.once('ready', callback);
  }
  
  return watcher;
}

function debug(options, callback) {
  var bugger = rdbg.connect(9222, 'localhost', function(targets) {
    var target = targets.filter(function(target) {
      return target.url.indexOf(options.host) > -1;
    })[0];
    
    bugger.attach(target, callback);
  });
  
  return bugger;
}

function browse(options, callback) {
  var cmd = util.format('%s http://%s:%d', options.browser, options.host, options.port);
  
  console.log(cmd);
  return child.exec(cmd, callback);
}

module.exports.serve = serve;
module.exports.watch = watch;
module.exports.bundle = bundle;
module.exports.debug = debug;
module.exports.browse = browse;
