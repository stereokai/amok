var child = require('child_process');
var http = require('http');
var test = require('tape');
var fs = require('fs');
var path = require('path');
var url = require('url');

test('bin print version', function (test) {
  test.plan(4);
  var options = [
    '-V',
    '--version'
  ];

  options.forEach(function (option) {
    var args = ['bin/amok.js', option];
    test.comment(args.join(' '));

    var cli = child.spawn('node', args);

    cli.stdout.on('data', function (data) {
      var message = data.toString();
      test.equal(message, require('../package.json').version + '\n');
    });

    cli.on('close', function (code) {
      test.equal(code, 0);
    });
  });
});

test('bin print help', function (test) {
  test.plan(4);
  var options = [
    '-h',
    '--help'
  ];

  options.forEach(function (option) {
    var args = ['./bin/amok.js', option];
    test.comment(args.join(' '));

    var cli = child.spawn('node', args);

    cli.stdout.on('data', function (data) {
      var message = data.toString();
      test.ok(message.indexOf('Usage:') > -1);
    });

    cli.on('close', function (code) {
      test.equal(code, 0);
    });
  });
});