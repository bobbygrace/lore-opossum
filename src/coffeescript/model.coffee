Backbone = require 'backbone'

class LoremModel extends Backbone.Model
  defaults: ->
    ls = JSON.parse localStorage.getItem('settings')
    {
      flavor: ls?["flavor"] ? "Lorem Ipsum"
      paragraphs: ls?["paragraphs"] ? 3
      format: ls?["format"] ? "Text"
    }

  set: ->
    super
    localStorage.setItem("settings", JSON.stringify(@attributes))

  setFlavor: (value) ->
    @set({flavor: value})

  setParagraphs: (value) ->
    @set({paragraphs: value})

  setFormat: (value) ->
    @set({format: value})

module.exports = LoremModel
