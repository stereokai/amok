var child = require('child_process');
var temp = require('temp');
var which = require('which');
var path = require('path');
var extend = require('extend');
var fs = require('fs');

function browse(name, args) {
  var options = extend({
    cwd: process.cwd(),
  }, arguments[2] === undefined ? {} : arguments[2]);

  var command = (function () {
    var cmd = (function() {
      var bin = process.env[name.toUpperCase() + '_BIN'];
      if (bin !== undefined) {
        return bin;
      }

      switch(name) {
      case 'chrome':
        if (process.platform === 'win32') {
          return 'chrome';
        } else if (process.platform === 'darwin') {
          return 'Google\ Chrome';
        } else {
          return 'google-chrome';
        }
        break;

      case 'chromium':
        if (process.platform === 'win32') {
          return 'chromium';
        } else if (process.platform === 'darwin') {
          return 'Chromium';
        } else {
          return 'chromium-browser';
        }
        break;
      }
    }());

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
    }

    return which.sync(cmd, { path: searchPath.join(path.delimiter) });
  }());

  var args = (function() {
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

    return args;
  }());

  var exe = child.spawn(command, args, options);
  setTimeout(function() {
    exe.emit('ready');
  }, 1000);

  return exe;
}

module.exports = browse;
