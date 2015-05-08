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
    var executables = {
      chrome: [
        'chrome',
        'Google\ Chrome',
        'google-chrome'
      ],

      chromium: [
        'chromium',
        'Chromium',
        'chromium-browser',
      ],
    }[name];

    executables.unshift(process.env[name.toUpperCase() + '_BIN']);

    var paths = process.env['PATH'].split(path.delimiter);
    paths = paths.concat({
      chrome: [
        process.env['LOCALAPPDATA'] + '\\Google\\Chrome\\Application\\',
        process.env['PROGRAMFILES'] + '\\Google\\Chrome\\Application\\',
        process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\',
        '/Applications/Google\ Chrome.app/Contents/MacOS/'
      ],
      chromium: [
        '/Applications/Chromium.app/Contents/MacOS/'
      ],
    }[name]).filter(function(pathname) {
      return fs.existsSync(pathname);
    });

    var envpath = process.env['PATH'];
    process.env['PATH'] = paths.join(path.delimiter);

    var cmd = executables.map(function(executable) {
      try {
        return which.sync(executable);
      } catch (error) {
        return undefined;
      }
    }).filter(function(executable) {
      return executable !== undefined;
    })[0];

    process.env['PATH'] = envpath;
    return cmd;
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
