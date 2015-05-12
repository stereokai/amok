# amok-browser - Browser runtime environment additions
## SYNOPSIS
```js
window.addEventListener('add', callback);
window.addEventListener('remove', callback);
window.addEventListener('change', callback);
window.addEventListener('source', callback);
```

## DESCRIPTION

amok(1) augments the the browser runtime environment with events on the global `window` object, these events can be used to perform further domain specific processing when external resource files change or script source definitions are refreshed within the runtime.

## NOTES

These runtime environment additions are only available while amok(1) is connected to the browser, and only to the page which amok(1) has established a connection with.

## SEE ALSO
amok(1)