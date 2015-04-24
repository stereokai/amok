var child = require('child_process');
var temp = require('temp');
var which = require('which');

function open(name, args, options) {
  options = options || {};
  var command = undefined;

  switch (name) {
    case 'chrome':
      if (process.env['CHROME_BIN']) {
        command = process.env['CHROME_BIN'];
        break;
      }

      if (process.platform === 'win32') {
        var suffix = '\\Google\\Chrome\\Application\\chrome.exe';
        var prefixes = [
          process.env['LOCALAPPDATA'],
          process.env['PROGRAMFILES'],
          process.env['PROGRAMFILES(X86)']
        ];

        var executables = prefixes.map(function(prefix) {
          return prefix + suffix;
        }).filter(function(path) {
          return fs.existsSync(path);
        });

        command = executables[0];
      } else if (process.platform === 'darwin') {
        command = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      } else {
        command = which.sync('google-chrome');
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

  var exe = child.spawn(command, args);
  setTimeout(function() {
    exe.emit('ready');
  }, 1000);

  return exe;
}

module.exports = open;
