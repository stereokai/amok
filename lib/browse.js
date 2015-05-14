var async = require('async');
var child = require('child_process');
var extend = require('extend');
var fs = require('fs');
var path = require('path');
var temp = require('temp');
var which = require('which');
var net = require('net');

function browse(name, args) {
  var options = {
    cwd: process.cwd(),
    debugPort: 9222
  };

  if (arguments.length === 3) {
    var callback = arguments[2];
  } else {
    var options = extend(options, arguments[2]);
    var callback = arguments[3];
  }

  if (typeof args === 'string') {
    args = [args];
  }

  var cmd = process.env[name.toUpperCase() + '_BIN'];
  if (cmd === undefined) {
    switch (name) {
      case 'chrome':
        if (process.platform === 'win32') {
          cmd = 'chrome';
        } else if (process.platform === 'darwin') {
          cmd = 'Google\ Chrome';
        } else {
          cmd = 'google-chrome';
        }
        break;

      case 'chromium':
        if (process.platform === 'win32') {
          cmd = 'chromium';
        } else if (process.platform === 'darwin') {
          cmd = 'Chromium';
        } else {
          cmd = 'chromium-browser';
        }
        break;
    }
  }

  var searchPath = process.env['PATH'].split(path.delimiter);

  switch (name) {
    case 'chrome':
      if (process.platform === 'win32') {
        searchPath.push(
          process.env['LOCALAPPDATA'] + '\\Google\\Chrome\\Application\\',
          process.env['PROGRAMFILES'] + '\\Google\\Chrome\\Application\\',
          process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\');
      } else if (process.platform == 'darwin') {
        searchPath.push('/Applications/Google\ Chrome.app/Contents/MacOS/');
      }
      break;

    case 'chromium':
      if (process.platform === 'darwin') {
        searchPath.push('/Applications/Chromium.app/Contents/MacOS/');
      }
      break;
  }

  args = args.slice(0);

  switch (name) {
    case 'chrome':
    case 'chromium':
      args.unshift(
        '--remote-debugging-port=' + options.debugPort,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-translate',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-zero-browsers-open-for-tests',
        '--user-data-dir=' + temp.mkdirSync(name)
      );
      break;
  }

  searchPath = searchPath.join(path.delimiter);
  which(cmd, {
    path: searchPath
  }, function(error, cmd) {
    if (error) {
      return callback(error);
    }

    var exe = child.spawn(cmd, args, options);
    exe.on('error', callback);

    var interval = setInterval(function() {
      var socketOptions = {
        port: options.debugPort,
      };

      var socket = net.createConnection(socketOptions);
      socket.on('error', function(error) {});

      socket.on('connect', function() {
        exe.removeListener('error', callback);
        clearInterval(interval);

        callback(null, exe);
      });
    }, 100);
  });
}

module.exports = browse;
