$               = require 'zeptojs'
_               = require 'underscore'
Backbone        = require 'backbone'
Backbone.$      = $
Clipboard       = require 'clipboard'
flavors         = require './flavors.coffee'
track           = require './analytics/track.coffee'
{ render, p, raw, textarea, br, text, li, ul, a } = require 'teacup'


class AppView extends Backbone.View

  events:
    "click .js-select-flavor a": "selectFlavor"
    "click .js-select-amount a": "selectAmount"
    "click .js-select-format a": "selectFormat"

    "click .js-copy-to-clipboard": "preventDefault"

    "click .js-bio": "openedBio"
    "click .js-open-statement": "openStatement"
    "click .js-close-statement": "closeStatement"

  initialize: ->
    # http://stackoverflow.com/a/23522755
    @isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    @fLoadedStatement = false
    @listenTo @model, "change", @renderIpsum
    @listenTo @model, "change:flavor", @renderFlavors
    @listenTo @model, "change:amount", @renderAmounts
    @listenTo @model, "change:format", @renderFormats

    @clipboardTextValue = ''

    # Clipboard.js stuff

    @ClipboardClient = new Clipboard ".js-copy-to-clipboard", {
      text: =>
        @getClipboardTextValue()
    }

    @ClipboardClient.on "success", (e) =>
      track('Copy', 'Clicked')
      @flashCopiedState()

    # Show "Ctrl" if not a Mac
    if !/Mac|MacIntel|iPod|iPhone|iPad/.test(navigator.platform)
      @$(".js-meta-key-type").text 'Ctrl'


    # Only show Cmd+C if Safari

    if @isSafari
      $(".js-copy-to-clipboard").addClass 'hidden'
      $(".js-copy-cmd-c-text").removeClass 'hidden'
    else
      $(".js-copy-to-clipboard").removeClass 'hidden'
      $(".js-copy-cmd-c-text").addClass 'hidden'


    # Shortcuts

    $(document).keydown (e) =>

      # Close Statement
      if e.keyCode == 27
        @closeStatement(e)

      # Clicked Control + C, copy to clipboard
      else if e.keyCode == 67 && (e.ctrlKey || e.metaKey)

        @flashCopiedState()
        track('Copy', 'Cmd + C')

        if window.getSelection?()?.toString()
          return

        if document.selection?.createRange().text
          return

      # Make a fake textarea and soak up the system's control + c shortcut
      _.defer =>
        $clipboardContainer = $(".js-lorem-clipboard").empty().show()
        clipboardInput = render ->
          textarea '.lorem-clipboard-input.js-lorem-clipboard-input'
        $clipboardInput = $(clipboardInput)
          .val(@getClipboardTextValue())
          .appendTo($clipboardContainer)
          .focus()
        $clipboardInput[0].select()

    $(document).keyup (e) ->

      if $(e.target).is(".js-lorem-clipboard-input")
        $(".js-lorem-clipboard").empty().hide()

  render: ->
    @setElement $(".js-app")

    @renderFlavors()
    @renderAmounts()
    @renderFormats()
    @renderIpsum()

    _.defer =>
      @$el.removeClass("hidden")

    @

  renderFlavors: ->
    selectedFlavor = @model.get("flavor")

    getAttrs = (flavor) ->
      classes = ["meta-control-options-item-link"]
      if flavor == selectedFlavor
        classes.push "is-current"

      return {
        "href": "#"
        "data-flavor": flavor
        "class": classes.join(" ")
      }

    html = render ->
      for flavor of flavors
        li '.meta-control-options-item', ->
          a getAttrs(flavor), ->
            text flavor

    @$(".js-list-flavors").html html

    @

  renderAmounts: ->
    amounts = ["Tiny", "Moderate", "Huge"]
    selectedAmount = @model.get("amount")

    getAttrs = (amount) ->
      classes = ["meta-control-options-item-link"]
      if amount == selectedAmount
        classes.push "is-current"

      return {
        "href": "#"
        "data-amount": amount
        "class": classes.join(" ")
      }

    html = render ->
      for amount in amounts
        li '.meta-control-options-item', ->
          a getAttrs(amount), ->
            text amount

    @$(".js-list-amounts").html html

    @

  renderFormats: ->
    formats = ["Text", "HTML", "JSON"]
    selectedFormat = @model.get("format")

    getAttrs = (format) ->
      classes = ["meta-control-options-item-link"]
      if format == selectedFormat
        classes.push "is-current"

      return {
        "href": "#"
        "data-format": format
        "class": classes.join(" ")
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
    amount = @model.get("amount")

    numParagraphs = switch amount
      when "Tiny" then "1"
      when "Moderate" then "3"
      when "Huge" then "8"

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

    @clipboardTextValue = clipboard.trim()

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
    track('Select Flavor', value)
    false

  selectAmount: (e) ->
    e.preventDefault()
    value = $(e.target).attr("data-amount")
    @model.setAmount(value)
    track('Select Amount', value)
    false

  selectFormat: (e) ->
    e.preventDefault()
    value = $(e.target).attr("data-format")
    @model.setFormat(value)
    track('Select Format', value)
    false

  flashCopiedState: ->
    selector = ".js-copy-to-clipboard"
    if @isSafari
      selector = ".js-copy-cmd-c-text"

    $copyBtn = @$(selector)

    originalText = $copyBtn.html()

    $copyBtn
      .addClass 'is-active'
      .text "Copied!"

    setTimeout ->
      $copyBtn
        .html originalText
        .removeClass 'is-active'
    , 2000

  openStatement: (e) ->
    e.preventDefault()

    if !@fLoadedStatement
      $.get "/statement.html", (data) =>
        @fLoadedStatement = true
        @$(".js-statement").html data

    $("body").addClass("is-shown-statement")

    track('Statement', 'Opened')
    false

  closeStatement: (e) ->
    e?.preventDefault()
    $("body").removeClass("is-shown-statement")
    track('Statement', 'Closed')
    false

  getClipboardTextValue: ->
    @clipboardTextValue

  openedBio: (e) ->
    track('Bio', 'Opened')

  preventDefault: (e) ->
    e.preventDefault()


module.exports = AppView
