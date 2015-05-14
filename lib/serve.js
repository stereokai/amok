var fs = require('fs');
var http = require('http');
var mime = require('mime');
var url = require('url');
var path = require('path');
var extend = require('extend');
var util = require('util');

function serve(port, host) {
  var options = {
    cwd: process.cwd(),
    scripts: {}
  };

  if (arguments.length === 3) {
    var callback = arguments[2];
  } else {
    var options = extend(options, arguments[2]);
    var callback = arguments[3];
  }

  var server = http.createServer();

  server.on('error', reject);
  server.on('listening', accept);
  server.on('request', handle);

  server.listen(port, host);

  function handle(request, response) {
    var uri = url.parse(request.url);

    if (uri.pathname === '/' || uri.pathname === '/index.html') {
      return index(request, response);
    } else if (uri.pathname === 'favicon.ico') {
      return response.end();
    } else {
      return file(request, response);
    }

    function file(request, response) {
      var filename = path.join(options.cwd, uri.pathname);

      for (var name in options.scripts) {
        if (options.scripts.hasOwnProperty(name)) {
          if (options.scripts[name] === path.relative('/', uri.path)) {
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
        } else {
          response.writeHead(404);
          response.end('404');
        }
      });
    }

    function index(request, response) {
      var filename = path.join(options.cwd, 'index.html');

      fs.exists(filename, function(exists) {
        if (exists) {
          return file(request, response);
        } else {
          response.setHeader('content-type', 'text/html');
          response.write('<!doctype html><head><meta charset="utf-8"></head><body>');

          for (var name in options.scripts) {
            if (options.scripts.hasOwnProperty(name)) {
              response.write('<script src="' + options.scripts[name] + '"></script>');
            }
          }

          response.end('</body>');
        }
      });
    }
  }

  function reject(error) {
    callback(error);
  }

  function accept() {
    server.removeListener('error', reject);
    callback(null, server);
  }
}

module.exports = serve;
