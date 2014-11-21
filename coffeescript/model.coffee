Backbone = require 'backbone'

class LoremModel extends Backbone.Model
  defaults: ->
    ls = JSON.parse localStorage.getItem('settings')
    {
      type: ls?["type"] ? "Trello"
      paragraphs: ls?["paragraphs"] ? 3
      format: ls?["format"] ? "Text"
    }

  set: ->
    super
    localStorage.setItem("settings", JSON.stringify(@attributes))

  setType: (value) ->
    @set({type: value})

  setParagraphs: (value) ->
    @set({paragraphs: value})

  setFormat: (value) ->
    @set({format: value})

module.exports = LoremModel
