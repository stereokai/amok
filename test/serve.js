var amok = require('../');
var fs = require('fs');
var http = require('http');
var test = require('tape');

test('serve html', function(t) {
  t.plan(3);

  var options = {
    cwd: 'test/fixture/serve-index'
  };

  var server = amok.serve(8888, 'localhost', options);
  server.on('listening', function() {
    http.get({
      host: 'localhost',
      port: 8888,
      path: '/index.html'
    }, function(response) {
      t.equal(response.statusCode, 200, 'status code 200');

      var actual = '';
      response.on('data', function(data) {
        actual += data;
      });

      response.on('end', function() {
        fs.readFile('test/fixture/serve-index/index.html', 'utf-8', function(error, expect) {
          t.error(error, 'file read');
          t.equal(actual, expect, 'served file matches read file');
        });
      });
    });
  });

  t.on('end', function() {
    server.close();
  });
});

test('serve script', function(t) {
  t.plan(3);

  var options = {
    cwd: 'test/fixture/serve-scripts',
    scripts: {
      'test/fixture/serve-index/index.js': 'other.js'
    }
  };

  var server = amok.serve(8888, 'localhost', options);
  server.on('listening', function() {
    http.get({
      host: 'localhost',
      port: 8888,
      path: '/other.js'
    }, function(response) {
      t.equal(response.statusCode, 200, 'status code 200');

      var actual = '';
      response.on('data', function(data) {
        actual += data;
      });

      response.on('end', function() {
        fs.readFile('test/fixture/serve-index/index.js', 'utf-8', function(error, expect) {
          t.error(error, 'file read');
          t.equal(actual, expect, 'served file matches read file');
        });
      });
    });
  });

  t.on('end', function() {
    server.close();
  });
});

test('serve index', function(t) {
  t.plan(2);

  var options = {
    cwd: 'test/fixture/serve-scripts',
    scripts: {
      'test/fixture/serve-index/index.js': 'index.js'
    }
  };

  var server = amok.serve(8888, 'localhost', options);
  server.on('listening', function() {
    http.get({
      host: 'localhost',
      port: 8888,
      path: '/index.html'
    }, function(response) {
      t.equal(response.statusCode, 200, 'status code 200');

      var actual = '';
      response.on('data', function(data) {
        actual += data;
      });

      response.on('end', function() {
        t.notEqual(actual.indexOf('<script src="index.js">'), -1);
      });
    });
  });

  t.on('end', function() {
    server.close();
  });
});
