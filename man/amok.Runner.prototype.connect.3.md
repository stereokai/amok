## NAME

`amok.Runner.prototype.connect` -- connect to a client

## SYNOPSIS

```js
connect(port, host, [callback]);
```

## PARAMETERS
`port` *Integer*
:   The port number to use.

`host` *String`
:   The host address to use.

`callback` *function()*
:   The callback to use.

## RETURN VALUE

The `amok.Runner` object.

## DESCRIPTION

Runs through all current middleware stack with `amok.Runner.prototype.run`,
connecting to the client specified by `port` and `host` after the middleware has run.

The `callback` will be added on the `connect` event of the runner object.

## SEE ALSO

[`amok.Runner.prototype.close`](amok.Runner.prototype.close.3.md)