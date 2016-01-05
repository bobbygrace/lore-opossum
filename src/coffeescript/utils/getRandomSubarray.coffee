# http://stackoverflow.com/a/11935263
module.exports = (arr, size) ->
  shuffled = arr.slice(0)
  i = arr.length
  temp = undefined
  index = undefined
  while i--
    index = Math.floor((i + 1) * Math.random())
    temp = shuffled[index]
    shuffled[index] = shuffled[i]
    shuffled[i] = temp
  shuffled.slice 0, size
