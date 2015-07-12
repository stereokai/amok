---
---

## NAME

amok.compiler -- watch and incrementally compile scripts.

## SYNOPSIS

```js
compiler(compiler, args, [output])
```

## PARAMETERS
`command` *String*
:   The command to run

`args` *Array*
:   List of string arguments

`output` *stream.Readable*
:   The output stream to use

## DESCRIPTION

Creates a middleware function that spawns a compiler process specified with the given
`command` with command line arguments in `args`. If omitted, `args` defaults to an
empty *Array*.

Standard output and standard error streams will be piped to the specified `output` stream.
If omitted `output` defaults to `undefined`.

## RETURN VALUE

`function(client, runner, done)`

## EXAMPLES

Get compilation result

```js
var amok = require('amok');

runner.use(amok.compiler('babel'));
runner.run(function(error, inspector, runner) {
  var scripts = runner.get('scripts');
  console.dir(scripts);
});
```

## SEE ALSO
