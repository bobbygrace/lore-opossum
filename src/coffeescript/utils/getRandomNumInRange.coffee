module.exports = (min, max) ->
  arr = [min..max]
  arr[Math.floor(Math.random()*arr.length)]
