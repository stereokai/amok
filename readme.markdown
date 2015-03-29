# Amok(1)
[![tips](https://img.shields.io/gratipay/caspervonb.svg?style=flat-square)](https://gratipay.com/caspervonb/)
[![chat](https://img.shields.io/badge/gitter-join%20chat-green.svg?style=flat-square)](https://gitter.im/caspervonb/amok)
[![npm](https://img.shields.io/npm/v/amok.svg?style=flat-square)](https://www.npmjs.org/package/amok)

[![View the video](https://cloud.githubusercontent.com/assets/157787/6780089/1ed197f0-d19d-11e4-858a-2e14b90096b8.png)](https://www.youtube.com/watch?v=xHXqyfkct2w)

[![Support the fundraiser](https://cloud.githubusercontent.com/assets/157787/6764979/c806eed4-d007-11e4-93fc-b1c5f1a222fb.png)](https://www.bountysource.com/fundraisers/682-amok-live-editing-javascript)

## Synopsis
```sh
amok [options] <script>
```

## Description
Amok standalone command line tool for rapid prototyping and development of JavaScript applications.

It monitors changes in the file system. As soon as you save a file, it is then preprocessed, compiled and bundled as needed, and re-compiled in the client session without refreshing or restarting the client.

This re-compilation is done through a debugging session, unlike reloading or reevaluation, re-compilation leaves the application state intact, no side effects are executed when doing re-compilation.

Additional features include a zero configuration http development server for developing front end applications.

## Options
```
-h, --host <HOST>
  specify the http host, default HOST is localhost.

-p, --port <PORT>
  specify the http port, default PORT is 9966.

-H, --debugger-host <HOST>
  specify the remote debugger host, default HOST is localhost.

-P, --debugger-port <PORT>
  specify the remote debugger port, default PORT is 9222.

--client
  specify the client to spawn

--compiler
  specify the compiler to spawn

-v, --verbose
  enable verbose logging mode

--no-client
  disable client

--no-compiler
  disable compiler
```

Amok requires that a client is listening on the remote debugging port when launching, it can spawn a client for you at the appropriate time, this is set by passing the `--client` option with the executable name and appropriate flags, this option has automatic variables available to it.

Google Chrome and Chromium it needs to be started with a remote debugging port specified to enable remote debugging, the default expected port is 9222 `--remote-debugging-port=9222`.

```sh
amok --client `google-chrome --remote-debugging-port=9222`
```

Amok can also, optionally use a compiler to process script sources, this compiler is specified via the `--compiler` option, this option has automatic variables available to it.

Any extra arguments following the `--` terminator, will be passed as arguments when spawning the compiler, if one is specified.

## Examples
### Browserify
```sh
amok --client 'google-chrome --remote-debugging-port=9222' --compiler 'watchify -o $@' entry.js
```

### Webpack
```sh
amok --client 'google-chrome --remote-debugging-port=9222' --compiler 'webpack --watch --output-file $@' entry.js
```

## Environment Variables
These environment variables are used to provide amok with default values.

```
AMOK_CLIENT
  When set to a executable, will be used as the default client value.

AMOK_COMPILER
  When set to an executable, will be used as the default compiler value.
```

## Automatic Variables
These automatic variables are set and substituted when spawning clients and compilers.

```
$@
  When using a compiler, this is set to the output path of the compilation result
```
