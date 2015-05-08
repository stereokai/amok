# amok(1)
## SYNOPSIS
`amok` [OPTION...] <FILE>... [-- COMPILER OPTION...]

`amok` [OPTION...] <URL>

## DESCRIPTION
**Amok** enables a rapid workflow for developing web applications.

With one or more <FILE> arguments `amok` connects to the browser, watches and serves the input <FILES> via a http server alongside the contents of the working directory. If no `index.html` file is available in the working directory when a http request to `/` or `/index.html` is made, a default generated index will be served with the appropriate tags referencing the script files. The http server port and host may be configured via the `--port` and `--host` options respectivly.

The `--compiler` may be specified to incrementally preprocess the input <FILES> with a compiler or bundler in its watch mode, the compilation output will be mapped and served instead of the input <FILES>, any arguments succeeding `--` will be passed directly as arguments to the compiler upon spawning the compiler process.

With a single <URL> argument, `amok` connects to the browser and watches the files specified with the `--watch` option.

The `--browser` option may be used to specify a browser process which should be used to open the server URL, the browser will be spawned with the appropriate connection settings for accepting remote debugging sessions.
If the browser option is omitted a compatible browser must already be ready and accepting connections on the address configurable via the `--debug-port` and `--debug-host` options.

Once a remote debugging connection to a client (browser) has been established, `amok` will mirror the client's console output to stderr and stdout. Changes to monitored files will be broadcast as events on the global `window` and `process` objects. Changes to a source file that is loaded in the client will result in its source definitions being refreshed without having to reloading, no execution will take place therefore there will be no side effects, execution will continue uninterrupted and the runtime state will be preserved.

When the `--interactive` option is provided, `amok` will enter an interactive `read-eval-print-loop` once the debugging connection is established.

## OPTIONS
* `-h`, `--help`:
  Output usage information and exit

* `-V`, `--version`:
  Output the version number and exit

* `-d`, `--cwd` <DIR>:
  Change working directory

* `-s`, `--debug-host` <HOST>:
  Specify the remote debugging host, default HOST is `localhost`

* `-r`, `--debug-port` <PORT>:
  Specify the remote debugging port, default PORT is `9222`

* `-b`, `--browser` <BROWSER>:
  Specify a web browser to open with remote debugging enabled and accepting connections on `--debug-port` and `--debug-host`. BROWSER must be one of the following values: `chrome` or `chromium`.

* `-c`, `--compiler` <COMPILER>:
  Specify a compiler to preprocess input source files. COMPILER must be one of the following values: `babel`, `browserify`, `coffee`, `tsc` or `webpack`.

* `-a`, `--host` <HOST>:
  Specify the host of the http server, default HOST is `localhost`

* `-p`, `--port` <PORT>:
  Specify the port number of the http server, default PORT is `9966`

* `-w`, `--watch` <GLOB>:
  Specify a file watch pattern, default GLOB is `'.'`.

* `-i`, `--interactive`:
  Enable interactive mode (read-eval-print-loop)

* `-v`, `--verbose`:
  Enable verbose logging mode

## ENVIRONMENT
* `CHROME_BIN`:
  Path to the Google Chrome executable

* `CHROMIUM_BIN`:
  Path to the Chromium executable

## BUGS
* Chrome Developer Tools cannot be active at the same time, this is a limitation of Chrome, it only allows a single debugging connection at any given time which the developer tools get first priority too, opening the inspector will cause `amok` to disconnect, it will try to reconnect at a steady interval which for the duration until the developer tools are closed.