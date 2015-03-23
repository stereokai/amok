# Amok(1)
[![tips](https://img.shields.io/gratipay/caspervonb.svg?style=flat-square)](https://gratipay.com/caspervonb/)
[![chat](https://img.shields.io/badge/gitter-join%20chat-green.svg?style=flat-square)](https://gitter.im/caspervonb/amok)
[![npm](https://img.shields.io/npm/v/amok.svg?style=flat-square)](https://www.npmjs.org/package/amok)

[![View the video](https://cloud.githubusercontent.com/assets/157787/6780089/1ed197f0-d19d-11e4-858a-2e14b90096b8.png)](https://www.youtube.com/watch?v=xHXqyfkct2w)

[![tutorial](https://cloud.githubusercontent.com/assets/157787/6780102/2b9d538e-d19d-11e4-99ad-c1a9ac091aa0.png)]
(https://caspervonb.com/javascript/tools/live-edit-javascript-amok/)

[![Support the fundraiser](https://cloud.githubusercontent.com/assets/157787/6764979/c806eed4-d007-11e4-93fc-b1c5f1a222fb.png)](https://www.bountysource.com/fundraisers/682-amok-live-editing-javascript)


## Synopsis
```
amok [options] <script>
```

## Description
Amok is a command line tool for rapid prototyping and development of applications
written in JavaScript targeting the browser.

Edit your code live with realtime feedback, without having to reload
or loose your application state.

Amok can also process your application through a compilation and bundling
process like browserify, typescript, coffeescript or babel.

```
export BROWSER="google-chrome --remote-debugging-port=9222"
export BUNDLER="watchify"
  
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
    
--no-browser
  disable browser spawning
    
--no-bundler
  disable bundling

--no-debugger
  disable remote debugger
```

Any extra arguments will be passed along with the invocation to BUNDLER,
use -- to terminate argument parsing.

## Environment Variables
```
BROWSER
  When set to a executable, will be opened after the server has started.

BUNDLER
  When set to an executable, will be used to bundle scripts.
```
