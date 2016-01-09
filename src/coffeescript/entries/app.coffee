AppView = require '../appview.coffee'
AppState = require '../appstate.coffee'

state = new AppState()
new AppView({ state }).render()
