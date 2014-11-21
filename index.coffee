AppView         = require './coffeescript/appview.coffee'
LoremModel      = require './coffeescript/model.coffee'

new AppView({model: new LoremModel}).render()
