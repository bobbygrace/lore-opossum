Emitter = require 'tiny-emitter'

module.exports = class AppState extends Emitter
  constructor: ->
    return if localStorage.getItem('settings')?

    settings =
      'flavor': "Lorem Ipsum"
      'amount': "Moderate"
      'format': "Text"
    localStorage.setItem('settings', JSON.stringify(settings))

  getStorage: ->
    JSON.parse localStorage.getItem('settings')

  get: (field) ->
    @getStorage()[field]

  set: (key, value) ->
    ls = @getStorage()
    # don't save/emit if the value is the same
    return if ls[key] == value
    ls[key] = value
    localStorage.setItem('settings', JSON.stringify(ls))
    # let the world know
    @emit('change', key, value)

  setFlavor: (value) ->
    @set('flavor', value)

  setAmount: (value) ->
    @set('amount', value)

  setFormat: (value) ->
    @set('format', value)
