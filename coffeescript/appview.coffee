$               = require 'zeptojs'
_               = require 'underscore'
Backbone        = require 'backbone'
Backbone.$      = $
zeroclipboard   = require 'zeroclipboard'
mustache        = require 'mustache'
templates       = require './templates.coffee'
types           = require './terms.coffee'

zeroclipboard.config( { swfPath: "bower_components/zeroclipboard/dist/ZeroClipboard.swf" } )

class AppView extends Backbone.View
  events:
    "click .js-select-type a": "selectType"
    "click .js-select-paragraphs a": "selectNumParagraphs"
    "click .js-select-format a": "selectFormat"
    "click .js-copy-to-clipbard": "copyToClipboard"

  initialize: ->
    @listenTo @model, "change", @renderIpsum
    @listenTo @model, "change:type", @renderTypes
    @listenTo @model, "change:paragraphs", @renderNumParagraphs
    @listenTo @model, "change:format", @renderFormats

  render: ->
    @setElement $(".js-app") # :(

    @renderTypes()
    @renderNumParagraphs()
    @renderFormats()
    @renderIpsum()

    # ZeroClipboard stuff

    @clipboardClient = new zeroclipboard(@$(".js-copy-to-clipboard"))

    @clipboardClient.on "error", (e) =>
      @$(".js-copy-to-clipboard").addClass("hidden")

    @clipboardClient.on "ready", (e) =>
      @$(".js-copy-to-clipboard").removeClass("hidden")

    @clipboardClient.on "aftercopy", (e) =>
      originalText = @$(".js-copy-to-clipboard")[0].innerText
      @$(".js-copy-to-clipboard")[0].innerText = "Copied!"
      setTimeout =>
        @$(".js-copy-to-clipboard")[0].innerText = originalText
      , 2000

    _.defer =>
      @$el.removeClass("hidden")

    @

  renderTypes: ->
    $types = @$(".js-list-types")
    template = templates.optionType
    currentType = @model.get("type")
    html = ''

    for type of types
      data = { type }
      if type == currentType
        data.isCurrent = true
      html += mustache.render(template, data)

    $types.html html
    @

  renderNumParagraphs: ->
    paragraphsRange = [1..8]
    $paragraphs = @$(".js-list-paragraphs")
    template = templates.optionParagraphs
    currentNumParagraphs = Number @model.get("paragraphs")
    html = ''

    for p in paragraphsRange
      data = { num: p }
      if p == currentNumParagraphs
        data.isCurrent = true
      html += mustache.render(template, data)

    $paragraphs.html html
    @

  renderFormats: ->
    formats = ["Text", "HTML", "JSON"]
    $formats = @$(".js-list-formats")
    template = templates.optionFormat
    currentFormat = @model.get("format")
    html = ''

    for format in formats
      data = { format }
      if format == currentFormat
        data.isCurrent = true
      html += mustache.render(template, data)

    $formats.html html
    @

  renderIpsum: ->
    $ipsum = $(".js-render-ipsum")
    format = @model.get("format")
    numParagraphs = @model.get("paragraphs")

    switch format

      when "HTML"
        paragraphs = for p in [1..numParagraphs]
          "<p>#{@generateParagraph()}</p>"
        $ipsum.html mustache.render(templates.ipsumText, {paragraphs})

      when "JSON"
        paragraphs = for p in [1..numParagraphs]
          "\"#{@generateParagraph()}\""
        string = paragraphs.join(",")
        json = "[#{string}]"
        $ipsum.html mustache.render(templates.ipsumJSON, {json})

      else # "Text", the default
        paragraphs = (@generateParagraph() for p in [1..numParagraphs])
        $ipsum.html mustache.render(templates.ipsumText, {paragraphs})

    @

  generateSentence: ->
    # The sentence should be somehwere between 6 and 10 words or phrases
    lengthRange = [6..10]
    length = _.sample lengthRange
    type = @model.get("type")
    wordArray = _.sample types[type], length
    rawSentence = wordArray.join(" ")
    # Uppercase first letter and add a period.
    sentence = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1) + "."

  generateParagraph: ->
    # The paragraph should be somehwere between 4 and 10 sentences.
    lengthRange = [4..8]
    length = _.sample lengthRange
    paragraph = (@generateSentence() for s in [0..length]).join(" ")

  selectType: (e) ->
    e.preventDefault()
    value = $(e.target).attr("data-type")
    @model.setType(value)
    false

  selectNumParagraphs: (e) ->
    e.preventDefault()
    value = $(e.target).attr("data-paragraphs")
    @model.setParagraphs(value)
    false

  selectFormat: (e) ->
    e.preventDefault()
    value = $(e.target).attr("data-format")
    @model.setFormat(value)
    false

module.exports = AppView
