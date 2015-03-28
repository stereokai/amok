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

It monitors changes in the file system. As soon as you save a file, it is then preprocessed, compiled and bundled as needed, and reloaded in the browser session without refreshing. This keeps the application state unchanged while doing live edits.

Additional features include a zero configuration http development server, console redirection and code evaluation.

## Example

```sh
# Set to the browser you wish to spawn
# The executable needs to be in PATH
export AMOK_BROWSER='google-chrome --remote-debugging-port=9222'

# Set to the compiler you wish to use, make sure to set the output file
# The executable needs to be in PATH
export AMOK_BUNDLER='watchify -o $@'

# Then just start amok with the entry point of your application
amok myapp.js
```

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

-v, --verbose
  enable verbose logging mode

--no-browser
  disable browser spawning

--no-bundler
  disable bundling

--no-debugger
  disable remote debugger
```

Any extra arguments following the `--` terminator, will be passed as arguments when spawning the compiler, if one is specified.

## Environment Variables
These environment variables are used to provide amok with default values.

```
AMOK_BROWSER
  When set to a executable, will be opened after the server has started.

AMOK_BUNDLER
  When set to an executable, will be used to bundle scripts.
```

## Automatic Variables
These automatic variables are set and substituted when spawning clients and compilers.

```
$@
  When using a bundler, this is set to the output path of the bundle
```
