var amok = require('../');
var fs = require('fs');
var http = require('http');
var test = require('tape');
var path = require('path');
var url = require('url');

test('serve file', function(t) {
  t.plan(7);

  var options = {
    cwd: 'test/fixture/console',
    scripts: {
      'test/fixture/console/index.js': 'alias.js'
    }
  };

  amok.serve(8888, 'localhost', options, function(error, server) {
    t.error(error);

    var pathnames = ['index.js', 'index.html', 'alias.js'];
    pathnames.forEach(function(pathname) {
      http.get('http://localhost:8888/' + pathname, function(response) {
        t.equal(response.statusCode, 200);

        var body = '';
        response.on('data', function(chunk) {
          body += chunk;
        });

        response.on('end', function() {
          var filename = path.join(options.cwd, pathname);
          for (key in options.scripts) {
            if (options.scripts[key] === pathname) {
              filename = key;
            }
          }

          t.equal(body, fs.readFileSync(filename, 'utf-8'));
        });
      });
    });

    t.on('end', function() {
      server.close();
    });
  });
});

test('serve generated index', function(t) {
  t.plan(5);

  var options = {
    scripts: {
      'test/fixture/console/index.js': 'alias.js'
    }
  };

  var server = amok.serve(6666, 'localhost', options, function(error, server) {
    t.error(error);

    var pathnames = ['/', '/index.html'];
    pathnames.forEach(function(pathname) {
      http.get('http://localhost:6666' + pathname, function(response) {
        t.equal(response.statusCode, 200);

        var body = '';
        response.on('data', function(chunk) {
          body += chunk;
        });

        response.on('end', function() {
          t.notEqual(body.indexOf('<script src="alias.js">'), -1);
        });
      });
    });

    t.on('end', function() {
      server.close();
    });
  });
});
