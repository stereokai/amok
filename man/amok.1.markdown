# amok(1) -- Live editing, testing and debugging for the browser
## SYNOPSIS

`amok` [OPTION...] <URL>

`amok` [OPTION...] <FILE>...

## DESCRIPTION

**Amok** enables live editing, testing and debugging for browsers through a remote debug connection.

With a <URL>, **amok** will search for a page in the browser with a url matching that <URL> and connect to it.

With one or more input <FILES>, **amok** will add the <FILES> to the file system monitor and start a http server that serves files from the working directory with a in-memory dynamically generated *index.html* that references the input <FILES> with HTML script tags in the index body, placing an *index.html* file in the working directory will override the dynamic index generation. **amok** will search for a page in the browser with a url matching the server url and connect to it.

When **Amok** connects to the browser, it will mirror the console output stream to the standard output stream and refresh the source definitions of any scripts that are active in the browser runtime when the file system monitor detects a change to the source of the script.

Changes to the file system will also be available as events on the global object within the browser environment, see amok-events(3).

## OPTIONS
These options control control how amok will interact with the file system.

* `-d`, `--cwd`=<DIR>:
  Change the working directory.

* `-w`, `--watch`=<GLOB>:
  The file pattern for additional files to be added to the file monitoring process, the default value for <GLOB> is *'.'*.

The options control how amok will establish a remote debug connection.

* `-s`, `--debug-host`=<HOST>:
  The hostname on which the remote debug connection will be established on,
  the default <HOST> is *localhost*

* `-r`, `--debug-port`=<PORT>:
  The port number which the remote debug connection will be etablished on,
  the default <PORT> is *9222*.

* `-b`, `--browser`=<BROWSER>:
  The browser to open with options configured so that it will accept debug connections on the port set by the `-r` or `--debug-port` option, the value of <BROWSER> must be `chrome` or `chromium`

* `-i`, `--interactive`:
  Start in a read-eval-print-loop executing code in the remote context of the browser.

These options control the behavior of the http server.

* `-c`, `--compiler`=<COMPILER>:
  Uses the <COMPILER> to incrementally watch and preprocess input <FILES>, serving the preprocessed output in-place of the input <FILES>

  The value of BROWSER must be `babel`, `browserify`, `coffeescript`, `typescript` or `webpack`.

* `-a`, `--host`=<HOST>:
  The hostname which the http server will listen on,
  the default HOST is *localhost*.

* `-p`, `--port`=<PORT>:
  The port number which the http server will listen on,
  the default PORT is *9222*.

Miscellaneous options:

* `-v`, `--verbose`:
  Write verbose logging messages to standard error.

* `-h`, `--help`:
  Print **amok** usage information and exit.

* `-V`, `--version`:
  Print **amok** version information and exit.

## ENVIRONMENT

* `CHROME_BIN`:
  The full path of the Google Chrome executable, this environment variable takes presedence when searching for the chrome executable on the file system.

* `CHROMIUM_BIN`:
  The full path of the Chromium executable, this environment variable takes presedence when searching for the chrome executable on the file system.

## EXAMPLES

Open chrome with a local file system URL

    amok --browser chrome file://index.html

Open chrome with an external server URL

    amok --browser chrome http://localhost:4000

Open chrome with a bundle preprocessed by browserify and served via http at <http://localhost:9222/lib/index.js>

    amok --browser chrome --compiler browserify lib/index.js

## BUGS

`Google Chrome` and `Chromium` only allow a single connection to the remote debugging protocol at any given time, and the `Chrome Developer Tools` are given priority so opening them will cause `amok` to disconnect (see http://crbug.com/)

## COPYRIGHT

Copyright (C) 2015 Casper Beyer <http://caspervonb.com>

## SEE ALSO

amok-browser(3)