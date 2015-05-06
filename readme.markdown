# Amok - Live code editing for JavaScript
[![tips](https://img.shields.io/gratipay/caspervonb.svg?style=flat-square)](https://gratipay.com/caspervonb/)
[![chat](https://img.shields.io/badge/gitter-join%20chat-green.svg?style=flat-square)](https://gitter.im/caspervonb/amok)
[![npm](https://img.shields.io/npm/v/amok.svg?style=flat-square)](https://www.npmjs.org/package/amok)

![out](https://cloud.githubusercontent.com/assets/157787/7122192/4aa2b03e-e24c-11e4-886a-5f58181b5dbd.gif)

**Amok** is a free, cross-platform, open source standalone command line tool for rapid live development, testing and debugging of JavaScript web applications.

`amok` is written in JavaScript, runs on [node](https://nodejs.com) and is distributed via [npm](https://npmjs.com/amok).

* Zero Configuration Server:
  **Amok** has a zero configuration http development server built in that serves static scripts and static files, when no index.html is present, a default index will be generated on demand.

* Script Preprocessing:
  **Amok** can incrementally rebuild scripts with a variety of compilers that have a watch mode, including babel, browserify, coffeescript, typescript and webpack. 

* Live Code Editing:
  Amok will refresh source definitions without reloading the page in the browser when the source files change, execution will remain uninterrupted and no side effects will take place, preserving the application state.

* Console Mirroring:
  Amok mirrors the browser's `console.log`, `console.info`, `console.error`, `console.trace` output to `stderr` and `stdout`

* Interactive Mode:
  Amok has an interactive mode, inspect and modify the browser environment or application state through the terminal in a read-eval-print-loop.

* File Notifications:
  Amok emits file notifications as events on the global window and process objects, allowing for further domain specific live editing and hot reloading specialization.

## INSTALLATION
1. Download and install [node]
2. Open a terminal prompt
3. Run `npm install -g amok`

## USAGE
`amok --browser chrome app.js`

## DOCUMENTATION
See the [manpage](man/amok.1.markdown)

## SUPPORT
Join the [gitter chat](http://gitter.com/caspervonb/amok)

## RELEASE HISTORY
See the [changelog](changelog.markdown)

## LICENSE
Copyright (c) 2015 Casper Beyer under the [MIT License](license.markdown)