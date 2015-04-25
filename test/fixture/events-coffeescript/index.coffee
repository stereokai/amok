console.log 'ok'
if typeof window != 'undefined'
  window.addEventListener 'change', (event) ->
    console.log 'change ' + event.detail
    return
  window.addEventListener 'source', (event) ->
    console.log 'source ' + event.detail
    return

touched = false
