module.exports = (className, fn) ->
  for el in document.getElementsByClassName(className)
    el.addEventListener 'click', fn
