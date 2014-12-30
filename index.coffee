AppView         = require './src/coffeescript/appview.coffee'
LoremModel      = require './src/coffeescript/model.coffee'

new AppView({model: new LoremModel}).render()
