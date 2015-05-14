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

  async.waterfall([
    function(next) {
      var cmd = (name === 'browserify') ? 'watchify' : name;
      which(cmd, next);
    },
    function(cmd, next) {
      args = args.slice(0);

      var dirpath = temp.mkdirSync('scripts');
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

      var compiler = child.spawn(cmd, args, options);
      var filenames = Object.keys(scripts);

      async.until(function() {
        return filenames.every(function(filename) {
          return fs.existsSync(filename) && fs.statSync(filename).size > 1;
        });
      }, function(callback) {
        setTimeout(callback, 100);
      }, function() {
        next(null, compiler, scripts);
      });
    }
  ], callback);
}

module.exports = compile;
