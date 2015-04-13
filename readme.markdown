# Amok(1)
[![tips](https://img.shields.io/gratipay/caspervonb.svg?style=flat-square)](https://gratipay.com/caspervonb/)
[![chat](https://img.shields.io/badge/gitter-join%20chat-green.svg?style=flat-square)](https://gitter.im/caspervonb/amok)
[![npm](https://img.shields.io/npm/v/amok.svg?style=flat-square)](https://www.npmjs.org/package/amok)

## Synopsis
```sh
amok [options] <SCRIPT | URL>
```

## Installation
```
npm install amok -g
```

## Description
Amok standalone command line tool that enables rapid prototyping and
development of JavaScript based web applications through the client's
remote debugging interface.

Given a script as the entry point, it will start a zero configuration
http development server with a default overridable generated index.html.
The server may be configured to incrementally watch and compile the scripts
through preprocessors, compilers and bundlers. Such as typescript,
coffeescript, browserify, webpack and babel.

Alternatively a url may be specified as the entry point, in which case
it will connect to the client directly without starting the development
server.

If the client option is enabled, the executable of that client is
located and opened with the correct settings to allow it to accept
remote debugging connections.

Once connected to a client it monitors changes in the file system.
Eitting events on the global object in the client environment when such
changes occur.

When a change to the source of a script currently loaded in the client is
detected, it gets refreshed in the client without restarting the application.
No state is lost, execution is not interrupted and no side effects are executed.

Nearly all code can be refreshed while the application is running,
including top level functions, object prototypes,
classes, event handlers and other types of anonymous closures.

Output from the client's console calls gets mirrored into stdout and stderr.


## Options
```
-h, --help
  output usage information

-V, --version
  output the version number

--host <HOST>
  specify http host

--port <PORT>
  specify http port

--debugger-host <HOST>
  specify debugger host

--debugger-port <PORT>
  specify debugger port

-i, --interactive
  enable interactive mode

--client <PRESET | COMMAND>
  specify the client to spawn

--compiler <PRESET | COMMAND>
  specify the compiler to spawn

-v, --verbose
  enable verbose logging mode
```

A client must already listening on the same remote debugging port when
launching, or specified with the **client** option.

A compiler may be specified to process script sources served via the
http server with the **compiler** option, Any extra arguments and
options following the option parsing terminator **--**, will be passed
as extra options to the compiler. The specified compiler must have its
executable available via **PATH**.


## Example
```sh
amok --client chrome canvas.js
amok --client chrome http://localhost:9090
amok --client chrome --compiler webpack canvas.js
```

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

Dispatched when a file is added, `event` is a `CustomEvent` with
`detail` containing the filename relative to the current working directory.

#### Event: 'remove'
```js
  function (event) { }
```

Dispatched when a file is removed, `event` is a `CustomEvent` with
`detail` containing the filename relative to the current working directory.

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

Dispatched when a loaded script gets its source re-compiled, `event` is a `CustomEvent` with
`detail` containing the filename relative to the current working directory.

# See Also

[amok-examples](https://github.com/caspervonb/amok-examples)
