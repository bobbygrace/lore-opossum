$               = require 'zeptojs'
_               = require 'underscore'
Backbone        = require 'backbone'
Backbone.$      = $
zeroclipboard   = require 'zeroclipboard'
flavors         = require './flavors.coffee'
{ render, p, br, text, li, ul, a } = require 'teacup'

zeroclipboard.config( { swfPath: "swf/ZeroClipboard.swf" } )

class AppView extends Backbone.View
  events:
    "click .js-select-flavor a": "selectFlavor"
    "click .js-select-paragraphs a": "selectNumParagraphs"
    "click .js-select-format a": "selectFormat"
    "click .js-copy-to-clipbard": "copyToClipboard"

  initialize: ->
    @listenTo @model, "change", @renderIpsum
    @listenTo @model, "change:flavor", @renderFlavors
    @listenTo @model, "change:paragraphs", @renderNumParagraphs
    @listenTo @model, "change:format", @renderFormats

  render: ->
    @setElement $(".js-app") # :(

    @renderFlavors()
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

  renderFlavors: ->
    selectedFlavor = @model.get("flavor")

    getAttrs = (flavor) ->
      classes = "meta-control-options-item"
      if flavor == selectedFlavor
        classes += " meta-control-options-item--is-current"

      return {
        "href": "#"
        "data-flavor": flavor
        "class": classes
      }

    html = render ->
      for flavor of flavors
        li ->
          a getAttrs(flavor), ->
            text flavor

    @$(".js-list-flavors").html html

    @

  renderNumParagraphs: ->
    paragraphsRange = [1..8]
    selectedNumParagraphs = Number @model.get("paragraphs")

    getAttrs = (numPara) ->
      classes = "meta-control-options-item"
      if numPara == selectedNumParagraphs
        classes += " meta-control-options-item--is-current"

      return {
        "href": "#"
        "data-paragraphs": numPara
        "class": classes
      }

    html = render ->
      for numPara in paragraphsRange
        li ->
          a getAttrs(numPara), ->
            text numPara

    @$(".js-list-paragraphs").html html

    @

  renderFormats: ->
    formats = ["Text", "HTML", "JSON"]
    selectedFormat = @model.get("format")

    getAttrs = (format) ->
      classes = "meta-control-options-item"
      if format == selectedFormat
        classes += " meta-control-options-item--is-current"

      return {
        "href": "#"
        "data-format": format
        "class": classes
      }

    html = render ->
      for format in formats
        li ->
          a getAttrs(format), ->
            text format

    @$(".js-list-formats").html html

    @

  renderIpsum: ->
    $ipsum = $(".js-render-ipsum")
    format = @model.get("format")
    numParagraphs = @model.get("paragraphs")
    paragraphs = (@generateParagraph() for para in [1..numParagraphs])

    switch format

      when "HTML"
        html = render ->
          for para in paragraphs
            p "<p>#{para}</p>"
            br

      when "JSON"
        paragraphs = ("\"#{para}\"" for para in paragraphs)
        joinedParagraphs = paragraphs.join(",")

        html = render ->
          text "["
          text joinedParagraphs
          text "]"

      else # "Text", the default
        html = render ->
          for para in paragraphs
            p para
            br

    $ipsum.html html

    @

  generateSentence: ->
    # The sentence should be somehwere between 6 and 10 words or phrases
    lengthRange = [6..10]
    length = _.sample lengthRange
    flavor = @model.get("flavor")
    wordArray = _.sample flavors[flavor], length
    rawSentence = wordArray.join(" ")
    # Uppercase first letter and add a period.
    sentence = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1) + "."

  generateParagraph: ->
    # The paragraph should be somehwere between 4 and 10 sentences.
    lengthRange = [4..8]
    length = _.sample lengthRange
    paragraph = (@generateSentence() for s in [0..length]).join(" ")

  selectFlavor: (e) ->
    e.preventDefault()
    value = $(e.target).attr("data-flavor")
    @model.setFlavor(value)
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
