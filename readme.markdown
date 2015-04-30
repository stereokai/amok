# Amok(1)
[![tips](https://img.shields.io/gratipay/caspervonb.svg?style=flat-square)](https://gratipay.com/caspervonb/)
[![chat](https://img.shields.io/badge/gitter-join%20chat-green.svg?style=flat-square)](https://gitter.im/caspervonb/amok)
[![npm](https://img.shields.io/npm/v/amok.svg?style=flat-square)](https://www.npmjs.org/package/amok)

![out](https://cloud.githubusercontent.com/assets/157787/7122192/4aa2b03e-e24c-11e4-886a-5f58181b5dbd.gif)

Note this documentation refers to master, for the current release [npm](https://www.npmjs.org/package/amok).

## Synopsis
```sh
amok [options] <SCRIPT | URL>
```

## Installation
```
npm install amok -g
```

## Description
Amok standalone command line tool that enables rapid prototyping and development
of JavaScript based web applications through the client's remote debugging
interface.

Given a *SCRIPT* as the entry point, it will start a zero configuration http
development server with a default generated index.html that may be overriden by having a file called index.html. The server
may be configured to incrementally watch and compile the scripts through
preprocessors, compilers and bundlers. Such as typescript, coffeescript,
browserify, webpack and babel.

Alternatively a *URL* may be specified as the entry point, in which case it will
connect to the client directly without starting the development server.

If the client option is enabled, the executable of that client is located and
opened with the correct settings to allow it to accept remote debugging
connections.

Once connected to a client it mirrors the console output and monitors changes in
the file system.

When a change to the source of a script currently loaded in the client is
detected, it gets refreshed in the client without restarting the application,
keeping the application running without interruption or loosing state.

This refresh changes the source and re-compiles the code in the client, and is
applicable to prototypes, classes and closures.

Take note however that the script itself is does not evaluate again as this would
corrupt the state, no side effects will occur but notifications are sent to the
client as events to enable  further processing and evaluation.

## Options
```
-h, --help
  output usage information

-V, --version
  output the version number

-s, --debug-host <HOST>
  specify debug host

-r, --debug-port <PORT>
  specify debug port

-b, --browser <BROWSER>
  specify browser

-c, --compiler <COMPILER>
  specify compiler

-a, --host <HOST>
  specify http host

-p, --port <PORT>
  specify http port

-w, --watch <GLOB>
  specify watch pattern

-i, --interactive
  enable interactive mode

-v, --verbose
  enable verbose mode

-d, --cwd <DIR>
  change working directory
```

A client must already listening on the same remote debugging port when
launching, or specified with the **client** option.

A compiler may be specified to process script sources served via the http server
with the **compiler** option, Any extra arguments and options following the
option parsing terminator **--**, will be passed as extra options to the
compiler. The specified compiler must have its executable available via
**PATH**.

# Environment Variables
CHROME_BIN
  Set to override the executable used for chrome

## Examples
```sh
amok --browser chrome app.js
amok --browser chrome http://localhost:9090
amok --browser chrome --compiler webpack canvas.js
amok --browser chrome --compiler browserify canvas.js -- --transform babelify
```

See also [amok-examples](https://github.com/caspervonb/amok-examples)

## Client Environment
Events get emitted to aid with domain specific requirements.
These events are emitted on the global object,
if both window and process are available, events will be emitted on both objects.

### process
#### Event: 'add'
```js
  function (filename) { }
```

Emitted when a file is added.

#### Event: 'remove'
```js
  function (filename) { }
```
Emitted when a file is removed.

#### Event: 'change'
```js
  function (filename) { }
```

Emitted when the contents of a file is changed.

#### Event: 'source'
```js
  function (filename) { }
```

Emitted when a loaded script gets its source re-compiled.

### window
#### Event: 'add'
```js
  function (event) { }
```

Dispatched when a file is added, `event` is a `CustomEvent` with `detail`
containing the filename relative to the current working directory.

#### Event: 'remove'
```js
  function (event) { }
```

Dispatched when a file is removed, `event` is a `CustomEvent` with `detail`
containing the filename relative to the current working directory.

#### Event: 'change'
```js
  function (event) { }
```

Dispatched when the contents of a file changes, `event` is a `CustomEvent` with
`detail` containing the filename relative to the current working directory.

#### Event: 'source'
```js
  function (event) { }
```

Dispatched when a loaded script gets its source re-compiled, `event` is a
`CustomEvent` with `detail` containing the filename relative to the current
working directory.

## See Also

[amok-examples](https://github.com/caspervonb/amok-examples)
