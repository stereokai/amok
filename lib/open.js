var child = require('child_process');
var temp = require('temp');
var which = require('which');
var path = require('path');

function open(name, args) {
  var options = arguments[2] === undefined ? {} : arguments[2];

  var exenames = [];
  var exepaths = process.env['PATH'].split(path.delim);

  switch (name) {
    case 'chrome':
      exenames.push('Google\ Chrome', 'chrome.exe', 'google-chrome', 'chrome');

      if (process.platform === 'win32') {
        exepaths.push(
          process.env['LOCALAPPDATA'],
          process.env['PROGRAMFILES'],
          process.env['PROGRAMFILES(X86)']
        );
      } else if (process.platform === 'darwin') {
        exepaths.push('/Applications/Google Chrome.app/Contents/MacOS/');
      }

      args.push(
        '--remote-debugging-port=' + options.debuggerPort,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-translate',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-zero-browsers-open-for-tests',
        '--user-data-dir=' + temp.mkdirSync('amok-chrome')
      );

      break;
  }

  var command = process.env[name.toUpperCase() + '_BIN'];
  if (command === undefined) {
    // FIXME workaround, we don't want to permanently change PATH
    // but 'which' won't accept a path parameter
    // will get around to writing another util for it sometime.
    var envpath = process.env['PATH'];
    process.env['PATH'] = exepaths.join(path.delim);

    command = exenames.map(function(exename) {
      try {
        return which.sync(exename);
      } catch (noop) {}
    }).filter(function(exename) {
      return exename !== undefined;
    })[0];

    process.env['PATH'] = envpath;
  }

  var exe = child.spawn(command, args);
  setTimeout(function() {
    exe.emit('ready');
  }, 1000);

  return exe;
}

module.exports = open;
