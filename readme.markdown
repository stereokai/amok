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
http development server with a default overridable generated index.html,
which may be configured to incrementally watch and compile the scripts
through preprocessors, compilers and bundlers such as typescript,
coffeescript, browserify, webpack and babel.

Alternatively a url may be specified as the entry point, in which case
it will connect to the client directly without starting the development
server.

If the client option is enabled, the executable of that client is
located and opened with the correct settings to allow it to accept
remote debugging connections.

Once connected to a client it monitors changes in the file system,
emitting events on the global object in the client environment when such
changes occur, when a change to the source of a script currently loaded
in the client is detected, it gets re-compiled and refreshed in the
client without reloading, restarting, interrupting execution, loosing
any state, or executing side effects in the client application, output
from the client's console calls gets mirrored into stdout and stderr.


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
1. `git clone https://gist.github.com/d58c3eecb72ba3dd0846.git examples`
2. `cd examples`
3. `amok --client chrome canvas.js`

### Webpack
```sh
amok --client chrome --compiler webpack canvas.js
```

### Browserify
```sh
amok --client chrome --compiler browserify canvas.js
```

### Babel
```sh
amok --client chrome --compiler babel canvas.js
```

### TypeScript
```sh
amok --client chrome --compiler typescript canvas.ts
```

### CoffeeScript
```sh
amok --client chrome --compiler coffeescript canvas.coffee
```
