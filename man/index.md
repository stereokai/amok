---
---
# DOCUMENTATION

**Amok** is first and foremost a command line debugging and development workflow
tool for browsers, it works by connecting to a browser via a remote debugging
protocol so there's no additional setup required beyond having the browser
installed.

## INSTALLING

Amok requires [node.js](http://nodejs.org) and [npm](http://npmjs.com) to run,
if you're using Mac or Windows the best way to install node.js is to use one of
the installers from [http://nodejs.org](http://nodejs.org), on Linux it should
be available via the system package manager.

Once node.js is installed, amok can be installed by running the following
command from a command prompt.

```sh
$ npm install -g amok
```

Depending on the system configuration, the command may need to be run with
elevated user privileges.

## CONNECTING TO A BROWSER
To connect to a page in an existing browser process, run **amok** with the url
in of the page, the existing browser has to be accepting debug connections on
port 9222.

```
$ amok http://localhost:4000
```

The debugging port can be specified with the `debug-port` option.

```sh
$ amok http://localhost:4000 --debug-port 4000
```

## STARTING A BROWSER
A new browser process can be spawned by specifying a type of browser for the
browser option, the type of browser may be either `chrome` or `chromium`, this
will search in `PATH` and vendor installation directories for a browser of that
type.

```sh
$ amok --browser chrome http://localhost:4000
```

An absolute path for the browser can be specified via environment variables, use
this to specify the executable for alternative release channels or custom
installation paths.

```sh
$ export CHROME_BIN="/absolute/path/to/executable"
$ amok --browser chrome http://localhost:4000
```

Additional command line arguments may also be specified via environment
variables, use this to provide extra browser configuration.

```sh
$ export CHROME_FLAGS="--user-data-dir=/data_dir/"
$ amok --browser chrome http://localhost:4000
```

## STARTING A SERVER
**Amok** can also spawn a server by providing a script file as the entry point,
the server provides a generated index.html file if none is available with the
script entries as script tags.

```sh
$ amok --browser chrome app.js
```

The server port and hostname can be specified via the `http-port` and
`http-server` options, the default is `http://localhost:9966`.

```sh
$ amok --http-port 4000 --browser chrome app.js
```

## USING A PREPROCESSOR
When using a server, **amok** can also preprocess scripts via `babel`, `coffee`, `tsc`, `watchify`
or `webpack` with the `compiler` option, the resulting bundle will have the same
name as the entry file.

```sh
$ amok --browser chrome --compiler webpack app.js
```

Additional command line options may be passed to the compiler by ending argument
parsing with double dashes, anything succeeding that will be passed directly as
command line options to the compiler.

```sh
$ amok --browser chrome --compiler webpack app.js -- --module-bind js=babel
```

## HOT PATCHING SCRIPTS
**Amok** supports monitoring source files and hot patching function definitions
in active scripts when the source files change, scripts may become inactive and
garbage collected when nothing is referencing them, for instance if there are no
callbacks in a script.

Patches will be applied without interrupting execution of the script, and no
execution will take place therefore no side effects will occur.

To enable hot patching, use the hot option and specify a glob of which source
files to watch.

```js
$ amok --hot *.js http://localhost:4000
```

With a compiler, the glob is redundant, the compilation result will be monitored
in-place of any input files.

```sh
$ amok --browser chrome --compiler tsc --hot app.ts
```

In the browser execution context, an event is dispatched on the window object
after a successful patch has been applied, this can be used to perform certain
actions like re-rendering with the knowledge there are new function definitions
in action.

```js
window.on('patch', function(event) {
  React.render(/*...*/);
});
```

## WATCHING THE FILE SYSTEM
**Amok** can watch monitor the file system for changes with the `watch` option.

```sh
$ amok --watch *.css
```
Changes to files matching the pattern will be dispatched as events on the window
object in the browser execution context, which could be used to perform domain
specific actions like reloading assets.

```js
window.on('add', function(event) {
  console.log('%s added', event.detail.filename);
});

window.on('change', function(event) {
  console.log('%s changed', event.detail.filename);
});

window.on('unlink', function(event) {
  console.log('%s removed', event.detail.filename);
});
```

## MANUALS
See the manual pages for further information

- [amok (1)](amok.1.md)
: browser development and debugging tool

- [amok (3)](amok.3.md)
: browser development and debugging framework for node.js
