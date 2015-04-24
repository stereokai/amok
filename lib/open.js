var child = require('child_process');
var temp = require('temp');
var which = require('which');

var clients = {
  chrome: function chrome(args, options) {
    var command = (function() {
      switch (process.platform) {
      case 'win32':
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

        return executables[0];

      case 'darwin':
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

      default:
        return which.sync('google-chrome');
      }
    }());

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

    return { command: command, args: args };
  }
};

function open(name, args, options) {
  var client = null;
  if (clients[name]) {
    client = clients[name].call(null, args, options);
  } else {
    var args = options.match(/'[^"]*'|"[^"]*"|\S+/g);
    var command = args.shift();

    args.push(options.url);

    client = {
      args: args,
      command: command
    };
  }

  var exe = child.spawn(client.command, client.args);
  setTimeout(function() {
    exe.emit('ready');
  }, 1000);

  return exe;
}

module.exports = open;
