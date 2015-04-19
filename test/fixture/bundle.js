var console = require('console');

console.log('ok');

if (typeof (window) !== 'undefined') {
  window.addEventListener('add', function(event) {
    if (event.detail.search('bundle.js') > -1) {
      console.log('add', event.detail);
    }
  });

  window.addEventListener('change', function(event) {
    if (event.detail.search('bundle.js') > -1) {
      console.log('change', event.detail);
    }
  });

  window.addEventListener('source', function(event) {
    setTimeout(function() {
      if (event.detail.search('bundle.js') > -1) {
        console.log('source', event.detail);
      }
    }, 200);
  });
}
