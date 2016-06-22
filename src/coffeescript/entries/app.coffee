AppView = require '../appview.coffee'
AppState = require '../appstate.coffee'

stateDefaults =
  'flavor': "Lorem Ipsum"
  'format': "Text"

stateLocation = 'settings'

state = new AppState({ defaults: stateDefaults, location: stateLocation })
new AppView({ state }).render()
