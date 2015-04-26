var fs = require('fs');
var http = require('http');
var mime = require('mime');
var url = require('url');
var path = require('path');
var extend = require('extend');

function serve(port, host) {
  var options = extend({
    cwd: process.cwd(),
    scripts: {}
  }, arguments[2] === undefined ? {} : arguments[2]);

  var server = http.createServer();
  server.on('request', function(request, response) {
    if (request.url === '/') {
      request.url = '/index.html';
    }

    var location = url.parse(request.url);
    var filename = path.join(options.cwd, location.pathname);

    for (var name in options.scripts) {
      if (options.scripts.hasOwnProperty(name)) {
        if (options.scripts[name] === path.relative('/', location.pathname)) {
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

        for (var name in options.scripts) {
          if (options.scripts.hasOwnProperty(name)) {
            response.write('<script src="' + options.scripts[name] + '"></script>');
          }
        }

        response.end('</body>');
      } else {
        response.writeHead(404);
        response.end('404');
      }
    });
  });

  server.listen(port, host);
  return server;
}

module.exports = serve;
