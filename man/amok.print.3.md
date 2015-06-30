## NAME

amok.print -- redirect remote console to stream

## SYNOPSIS

```js
function print(stream)
```

## PARAMETERS
`stream` *stream.Writeable*
:   The stream to use

## DESCRIPTION

Creates a middleware function that mirrors the client's console stream to
the specified `stream`.

## RETURN VALUE

`function(client, runner, done)`

## EXAMPLES

Redirect inspector console to stdout

```js
var amok = require('amok');

var runner = amok.createRunner();
runner.use(amok.print(process.stdout));
runner.connect(9922, 'localhost');
```

## SEE ALSO

[amok.repl](amok.repl.3.md)