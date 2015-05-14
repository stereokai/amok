var async = require('async');
var child = require('child_process');
var extend = require('extend');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var temp = require('temp');
var which = require('which');

function compile(name, args) {
  var options = {
    cwd: process.cwd()
  };

  if (arguments.length === 3) {
    var callback = arguments[2];
  } else {
    var options = extend(options, arguments[2]);
    var callback = arguments[3];
  }

  args = args.slice();

  var dirpath = temp.mkdirSync(name);
  var pathname = args[0].replace(/\.[^\.]+$/, '.js');

  var filename = path.join(dirpath, pathname);
  var dirname = path.dirname(filename);
  mkdirp.sync(dirname);

  var scripts = {};
  scripts[filename] = pathname;

  switch (name) {
    case 'browserify':
      args.unshift(
        '--outfile',
        filename
      );
      break;

    case 'webpack':
      args.unshift(
        '--watch',
        '--output-file',
        filename
      );
      break;

    case 'tsc':
      args.unshift(
        '--watch',
        '--out',
        filename
      );
      break;

    case 'coffee':
      args.unshift(
        '--watch',
        '--compile',
        '--join',
        filename
      );
      break;

    case 'babel':
      args.unshift(
        '--watch',
        '--out-file',
        filename
      );
      break;
  }

  var cmd = (name === 'browserify') ? 'watchify' : name;
  which(cmd, function(error, cmd) {
    if (error) {
      return callback(error);
    }

    var exe = child.spawn(cmd, args, options);
    var filenames = Object.keys(scripts);

    var interval = setInterval(function() {
      filenames = filenames.filter(function(filename) {
        try {
          return fs.statSync(filename).size < 1;
        } catch (err) {
          return true;
        }
      });

      if (filenames.length == 0) {
        clearInterval(interval);
        setTimeout(function() {
          callback(null, exe, scripts);
        }, 25);
      }
    }, 0);
  });
}

module.exports = compile;
