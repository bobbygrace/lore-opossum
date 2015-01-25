Backbone = require 'backbone'

class LoremModel extends Backbone.Model
  defaults: ->
    ls = JSON.parse localStorage.getItem('settings')
    {
      flavor: ls?["flavor"] ? "Lorem Ipsum"
      amount: ls?["amount"] ? "Moderate"
      format: ls?["format"] ? "Text"
    }

  set: ->
    super
    localStorage.setItem("settings", JSON.stringify(@attributes))

  setFlavor: (value) ->
    @set({flavor: value})

  setAmount: (value) ->
    @set({amount: value})

  setFormat: (value) ->
    @set({format: value})

module.exports = LoremModel
