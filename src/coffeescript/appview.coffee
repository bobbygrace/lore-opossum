$               = require 'zeptojs'
_               = require 'underscore'
Backbone        = require 'backbone'
Backbone.$      = $
zeroclipboard   = require 'zeroclipboard'
flavors         = require './flavors.coffee'
Combokeys       = require 'combokeys'
LoremClipboard  = require './clipboard.coffee'
{ render, p, raw, br, text, li, ul, a } = require 'teacup'

zeroclipboard.config( { swfPath: "swf/ZeroClipboard.swf" } )

class AppView extends Backbone.View

  events:
    "click .js-select-flavor a": "selectFlavor"
    "click .js-select-paragraphs a": "selectNumParagraphs"
    "click .js-select-format a": "selectFormat"
    "click .js-copy-to-clipboard": "cancel"
    "click .js-open-statement": "openStatement"
    "click .js-close-statement": "closeStatement"

  initialize: ->
    @fLoadedStatement = false
    @loremClipboard = new LoremClipboard()
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

    @zeroClipboardClient = new zeroclipboard(@$(".js-copy-to-clipboard"))

    @zeroClipboardClient.on "error", (e) =>
      @$(".js-copy-to-clipboard").addClass("hidden")

    @zeroClipboardClient.on "ready", (e) =>
      @$(".js-copy-to-clipboard").removeClass("hidden")

    @zeroClipboardClient.on "copy", (e) =>
      clipboard = e.clipboardData
      clipboard.setData("text/plain", @loremClipboard.value)

    @zeroClipboardClient.on "aftercopy", =>
      @flashCopiedState()

    if !/Mac|iPod|iPhone|iPad/.test(navigator.platform)
      @$(".js-meta-key-type").text 'Ctrl'

    _.defer =>
      @$el.removeClass("hidden")


    # Shortcuts c/o Combokeys

    combokeys = new Combokeys(document)

    combokeys.bind "1", => @model.setParagraphs("1")
    combokeys.bind "2", => @model.setParagraphs("2")
    combokeys.bind "3", => @model.setParagraphs("3")
    combokeys.bind "4", => @model.setParagraphs("4")
    combokeys.bind "5", => @model.setParagraphs("5")
    combokeys.bind "6", => @model.setParagraphs("6")
    combokeys.bind "7", => @model.setParagraphs("7")
    combokeys.bind "8", => @model.setParagraphs("8")

    combokeys.bind "t", => @model.setFormat("Text")
    combokeys.bind "h", => @model.setFormat("HTML")
    combokeys.bind "j", => @model.setFormat("JSON")

    combokeys.bind "esc", => @closeStatement()

    @

  renderFlavors: ->
    selectedFlavor = @model.get("flavor")

    getAttrs = (flavor) ->
      classes = "meta-control-options-item-link"
      if flavor == selectedFlavor
        classes += " is-current"

      return {
        "href": "#"
        "data-flavor": flavor
        "class": classes
      }

    html = render ->
      for flavor of flavors
        li '.meta-control-options-item', ->
          a getAttrs(flavor), ->
            text flavor

    @$(".js-list-flavors").html html

    @

  renderNumParagraphs: ->
    paragraphsRange = [1..8]
    selectedNumParagraphs = Number @model.get("paragraphs")

    getAttrs = (numPara) ->
      classes = "meta-control-options-item-link"
      if numPara == selectedNumParagraphs
        classes += " is-current"

      return {
        "href": "#"
        "data-paragraphs": numPara
        "class": classes
      }

    html = render ->
      for numPara in paragraphsRange
        li '.meta-control-options-item', ->
          a getAttrs(numPara), ->
            text numPara

    @$(".js-list-paragraphs").html html

    @

  renderFormats: ->
    formats = ["Text", "HTML", "JSON"]
    selectedFormat = @model.get("format")

    getAttrs = (format) ->
      classes = "meta-control-options-item-link"
      if format == selectedFormat
        classes += " is-current"

      return {
        "href": "#"
        "data-format": format
        "class": classes
      }

    html = render ->
      for format in formats
        li '.meta-control-options-item', ->
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

        clipboard = render ->
          for para in paragraphs
            raw "<p>#{para}</p>\n\n"

      when "JSON"
        paragraphs = ("\"#{para}\"" for para in paragraphs)
        joinedParagraphs = paragraphs.join(",")

        html = render ->
          text "["
          text paragraphs
          text "]"

        clipboard = render ->
          text "["
          raw paragraphs
          text "]"

      else # "Text", the default
        html = render ->
          for para in paragraphs
            p para

        clipboard = render ->
          for para in paragraphs
            raw "#{para}\n\n"

    $ipsum.html html

    @loremClipboard.set clipboard

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

  flashCopiedState: ->
    $copyBtn = @$(".js-copy-to-clipboard")
    originalText = $copyBtn.html()
    $copyBtn.text "Copied!"
    setTimeout =>
      $copyBtn.html originalText
    , 2000

  openStatement: (e) ->
    e.preventDefault()

    if !@fLoadedStatement
      $.get "/statement.html", (data) =>
        @fLoadedStatement = true
        @$(".js-statement").html data

    $("body").addClass("is-shown-statement")

    false

  closeStatement: (e) ->
    e?.preventDefault()
    $("body").removeClass("is-shown-statement")
    false

  cancel: (e) ->
    e.preventDefault()
    false


module.exports = AppView
