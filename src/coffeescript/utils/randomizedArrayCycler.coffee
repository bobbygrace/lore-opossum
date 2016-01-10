# Chooses an item from an array at random without repeats. Recycles items once
# it cycles through list.

# http://stackoverflow.com/a/17891411
module.exports = (array) ->
  copy = array.slice(0)
  ->
    if copy.length < 1
      copy = array.slice(0)
    index = Math.floor(Math.random() * copy.length)
    item = copy[index]
    copy.splice index, 1
    item
