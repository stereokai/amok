## NAME

amok -- debugging and development tool for browsers

## SYNOPSIS

**amok** [OPTION ...] _URL_ <br>
**amok** [OPTION ...] _FILE_ [-- COMPILER OPTION ...] <br>

## DESCRIPTION

**Amok** is a debugging tool that enables editor agnostic hot code patching,
testing and debugging for browsers through a remote connection.

 With a _url_, **amok** will connect to a tab with the given _url_, the
`--browser` option may be used in order to open the _url_ in a new browser
process.

With a _file_ **amok** will start a http server and connect to a browser tab
with the address of the server, the `--cwd`, `--port` and `--host` host options
dictate the root directory and address of the server. If no index.html file is
present one will be generated with the input files referenced as scripts in the
body of the document.

The `--compiler` option may be used in order to enable incremental preprocessing
with a compiler, which will shadow the path of the input _file_.

Output from the browser's console is redirected to standard output.
The `--debug-port` and `--debug-host` options define the address where the
remote debugging connection will be established.

The `--hot`, `--watch` and `--interactive` options enable hot code patching,
file system monitoring and an interactive read-eval-print-loop.

## OPTIONS

`--debug-port` _PORT_
:   The port number where the remote debugging connection will be established,
by default this will be on port `9222`.

`--debug-host` _PORT_
:   The host name where the remote debugging connection will be established,
by default this will be `localhost`.

`-b`, `--browser` _BROWSER_
:   Open the url in the specified browser which must be either `chrome` or `chromium`.

`-c`, `--cwd` _DIR_
:   Change the working directory to the specified directory, this directory
serves as the root from which the http server serves its files from;

`-w`, `--watch` _GLOB_
:   Enables monitoring of files matching the given glob pattern,
dispatching notifications in the forms of events on the window object

`-t`, `--hot` _GLOB_
:   Enables monitoring of active script files matching the specified glob pattern, hot patching function definitions on source file changes.

`--http-port` _PORT_
:   The port number where the http server will listen on when serving input *files*,
by default this will be `9966`.

`--http-host` _HOST_
:   The hostname where the http server will be listening on when serving input *files*,
by default this will be `localhost`.

`-i`, `--interactive`
:   Starts **amok** in a read-eval-print-loop.
:   Enables verbose output mode.

`-h`, `--help`
:   Print **amok** usage information and exit.

`-V`, `--version`
:   Print **amok** version information and exit.

## BROWSER EVENTS

The `--watch` option enables several events on the window object which are
dispatched when a file is added, changed or removed.

```js
addEventListener('add', function(event) {
  console.log('%s added', event.detail.filename);
});

addEventListener('change', function(event) {
  console.log('%s changed', event.detail.filename);
});

addEventListener('unlink', function(event) {
  console.log('%s removed', event.detail.filename);
});
```

The `--hot` option also enables an event on the window object which is
dispatched after a hot code patch has been applied successfully.

```
addEventListener('patch', function(event) {
  console.log('%s patched', event.detail.filename);
  console.log('event.detail.source);
});
```

## ENVIRONMENT

* `CHROME_BIN`
:   Path to a chrome executable used when opening chrome.

* `CHROME_FLAGS`
:   List of command line flags used when opening chrome.

* `CHROMIUM_BIN`
:   Path to a chromium executable used when opening chromium.

* `CHROMIUM_FLAGS`
:   List of command line options used when opening chromium.

## EXAMPLES

Connect to an existing browser tab
```sh
$ amok http://localhost:4000
```

Open chrome with a local file system URL

```sh
$ amok --browser chrome file://index.html
```

Open chrome with an external server URL

```sh
$ amok --browser chrome http://localhost:4000
```

Open chrome with an internal server and compiler

```sh
$ amok --browser chrome --compiler watchify lib/index.js
```

## BUGS

Chrome and Chromium only allow a connection at a time, the embedded developer tools will forcefully take away this connection when opened and disconnect amok, for more information see <http://crbug.com/129539>

## COPYRIGHT

Copyright (C) 2015 Casper Beyer <http://caspervonb.com>

## SEE ALSO
