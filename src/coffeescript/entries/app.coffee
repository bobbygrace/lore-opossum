AppView      = require '../appview.coffee'
LoremModel   = require '../model.coffee'

new AppView({model: new LoremModel}).render()
