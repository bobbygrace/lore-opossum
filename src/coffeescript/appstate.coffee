Emitter = require 'tiny-emitter'

module.exports = class AppState extends Emitter
  constructor: ({ @defaults, @location }) ->
    # set the defaults
    return if localStorage.getItem(@location)?
    localStorage.setItem(@location, JSON.stringify(@defaults))

  _getStorage: ->
    (JSON.parse localStorage.getItem(@location)) ? []

  get: (field) ->
    value = @_getStorage()[field]

    # fall back to default if we don't have a value
    if !value
      @set(field, @defaults[field])
      return @defaults[field]

    value

  set: (key, value) ->
    ls = @_getStorage()

    # don't save/emit if the value is the same
    return if ls[key] == value

    ls[key] = value
    localStorage.setItem(@location, JSON.stringify(ls))

    # let the world know
    @emit('change', key, value)
