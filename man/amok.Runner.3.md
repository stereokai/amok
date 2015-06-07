---
---
## NAME

amok.Runner -- debugging pipeline runner

## SYNOPSIS
```js
class Runner {
  constructor();

  get(key);
  set(key, value);

  use();
  run();

  connect(callback);
  close();
}
```

## EVENTS
`close`
:   emitted when the runner is closed.

## DESCRIPTION

## SEE ALSO

[amok.createRunner](amok.createRunner.3.md)
