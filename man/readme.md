# DOCUMENTATION
## INSTALLATION

**Amok** requires [node.js](http://nodejs.org) and [npm](http://npmjs.com) to run, if you're using Mac or Windows the best way to install node.js is to use one of the installers from [http://nodejs.org](http://nodejs.org), on Linux it should be available via the system package manager.

Once node.js is installed, amok can be installed by running the following command from a command prompt.

```sh
$ npm install -g amok
```

Depending on the system configuration, the command may need to be run with elevated user privileges.

## USAGE

**Amok** can either connect to an already running browser process or spawn a new browser process.

To connect to a page in an existing browser process, run **amok** with the url in of the page, the existing browser has to be accepting debug connections on port 9222.

```
$ amok http://localhost:4000
```

The debugging port can be specified with the `debug-port` option.

```sh
$ amok http://localhost:4000 --debug-port 4000
```

Spawning a browser option is done by specifying a type of browser for the browser option, which may be either `chrome` or `chromium`, this will search in `PATH` and vendor installation directories for a browser of that type.

```sh
$ amok --browser chrome http://localhost:4000
```

An absolute path for the browser can be specified via environment variables, use this to specify the executable for alternative release channels or custom installation paths.

```sh
$ export CHROME_BIN="/absolute/path/to/executable"
$ amok --browser chrome http://localhost:4000
```

Additional command line arguments may also be specified via environment variables, use this to provide extra browser configuration.

```sh
$ export CHROME_FLAGS="--user-data-dir=/data_dir/"
$ amok --browser chrome http://localhost:4000
```

**Amok** can also spawn a server by providing a script file as the entry point, the server provides a generated index.html file if none is available with the script entries as script tags.

```sh
$ amok --browser chrome app.js
```

The server port and hostname can be specified via the `http-port` and `http-server` options, the default is `http://localhost:9966`

```sh
$ amok --http-port 4000 --browser chrome app.js
```

The server can also preprocess scripts via babel, coffee, tsc, watchify or webpack with the `compiler` option, the resulting bundle will have the same name as the entry file.

```sh
$ amok --browser chrome --compiler webpack app.js
```

Additional command line options may be passed to the compiler by ending argument parsing with double dashes, anything succeeding that will be passed directly as command line options to the compiler.

```sh
$ amok --browser chrome --compiler webpack app.js -- --module-bind js=babel
```

## MANUALS

See the reference manuals for further information

* [amok(1)](amok.1.md)
:   browser development tool

* [amok(3)](amok.3.md)
:   browser development framework for node.js
