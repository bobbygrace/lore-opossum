# vendor
$               = require 'zeptojs'
Backbone        = require 'backbone'
Backbone.$      = $
Clipboard       = require 'clipboard'
{ render, p, raw, textarea, br, text, li, ul, a } = require 'teacup'

# data
flavors         = require './flavors.coffee'

# utils
getRandomSubarray = require './utils/getRandomSubarray.coffee'
getRandomNumInRange = require './utils/getRandomNumInRange.coffee'
getElem         = require './utils/getElem.coffee'
delegateClicks  = require './utils/delegateClicks.coffee'

# analytics
track           = require './analytics/track.coffee'


class AppView extends Backbone.View

  initialize: ->

    # http://stackoverflow.com/a/23522755
    @isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    @fLoadedStatement = false
    @clipboardTextValue = ''

    @listenTo @model, "change", @renderPlaceholder
    @listenTo @model, "change:flavor", @renderFlavors
    @listenTo @model, "change:amount", @renderAmounts
    @listenTo @model, "change:format", @renderFormats

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
      getElem("js-meta-key-type").innerText 'Ctrl'


    # Only show Cmd+C if Safari

    if @isSafari
      getElem("js-copy-to-clipboard").classList.add 'hidden'
      getElem("js-copy-cmd-c-text").classList.remove 'hidden'
    else
      getElem("js-copy-to-clipboard").classList.remove 'hidden'
      getElem("js-copy-cmd-c-text").classList.add 'hidden'


    # Shortcuts

    document.addEventListener 'keydown', (e) =>

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
      setTimeout =>
        clipboardContainer = getElem("js-lorem-clipboard")
        clipboardContainer.innerHTML = ''
        clipboardContainer.style.display = 'block'

        val = @getClipboardTextValue()
        clipboardInput = render ->
          textarea '.lorem-clipboard-input.js-lorem-clipboard-input', val

        clipboardContainer.innerHTML = clipboardInput

        input = getElem("js-lorem-clipboard-input")
        input.focus()
        input.select()

      , 0

    document.addEventListener 'keyup', (e) ->
      clipboardContainer = getElem("js-lorem-clipboard")
      clipboardContainer.innerHTML = ''
      clipboardContainer.style.display = 'none'

  render: ->
    @renderFlavors()
    @renderAmounts()
    @renderFormats()
    @renderPlaceholder()

    setTimeout ->
      getElem('js-app').classList.remove("hidden")
    , 0

    # Events
    getElem('js-copy-to-clipboard').addEventListener 'click', (e) ->
      e.preventDefault()

    getElem('js-bio').addEventListener 'click', (e) ->
      track('Bio', 'Opened')

    getElem('js-open-statement').addEventListener 'click', (e) =>
      @openStatement(e)

    @

  renderFlavors: ->
    selectedFlavor = @model.get("flavor")

    getAttrs = (flavor) ->
      classes = ["meta-control-options-item-link js-select-flavor"]
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

    getElem('js-list-flavors').innerHTML = html
    delegateClicks('js-select-flavor', @selectFlavor.bind(@))

    @

  renderAmounts: ->
    amounts = ["Tiny", "Moderate", "Huge"]
    selectedAmount = @model.get("amount")

    getAttrs = (amount) ->
      classes = ["meta-control-options-item-link js-select-amount"]
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

    getElem('js-list-amounts').innerHTML = html
    delegateClicks('js-select-amount', @selectAmount.bind(@))

    @

  renderFormats: ->
    formats = ["Text", "HTML", "JSON"]
    selectedFormat = @model.get("format")

    getAttrs = (format) ->
      classes = ["meta-control-options-item-link js-select-format"]
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

    getElem('js-list-formats').innerHTML = html
    delegateClicks('js-select-format', @selectFormat.bind(@))

    @

  renderPlaceholder: ->
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
          text "[#{paragraphs}"

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

    getElem('js-render-ipsum').innerHTML = html
    @clipboardTextValue = clipboard.trim()

    @

  generateSentence: ->
    # The sentence should be somehwere between 6 and 10 words or phrases
    length = getRandomNumInRange(6,10)
    flavor = @model.get("flavor")
    wordArray = getRandomSubarray flavors[flavor], length
    rawSentence = wordArray.join(" ")
    # Uppercase first letter and add a period.
    sentence = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1) + "."

  generateParagraph: ->
    # The paragraph should be somehwere between 4 and 8 sentences.
    length = getRandomNumInRange(4,8)
    paragraph = (@generateSentence() for s in [0..length]).join(" ")

  selectFlavor: (e) ->
    e.preventDefault()
    value = e.target.getAttribute("data-flavor")
    @model.setFlavor(value)
    track('Select Flavor', value)
    false

  selectAmount: (e) ->
    e.preventDefault()
    value = e.target.getAttribute("data-amount")
    @model.setAmount(value)
    track('Select Amount', value)
    false

  selectFormat: (e) ->
    e.preventDefault()
    value = e.target.getAttribute("data-format")
    @model.setFormat(value)
    track('Select Format', value)
    false

  flashCopiedState: ->
    className = "js-copy-to-clipboard"
    if @isSafari
      className = "js-copy-cmd-c-text"

    copyBtn = getElem(className)

    originalHTML = copyBtn.innerHTML

    copyBtn.classList.add 'is-active'
    copyBtn.innerHTML = "Copied!"

    setTimeout ->
      copyBtn.classList.remove 'is-active'
      copyBtn.innerHTML = originalHTML
    , 2000

  openStatement: (e) ->
    e.preventDefault()

    if !@fLoadedStatement
      request = new XMLHttpRequest()
      request.open('GET', '/statement.html', true)
      request.onload = =>
        if (request.status >= 200 && request.status < 400)
          @fLoadedStatement = true
          getElem("js-statement").innerHTML = request.responseText

          # Events
          getElem('js-close-statement').addEventListener 'click', (e) =>
            @closeStatement(e)

      request.onerror = -> return
      request.send()

    document.body.classList.add "is-shown-statement"

    track('Statement', 'Opened')
    false

  closeStatement: (e) ->
    e?.preventDefault()
    document.body.classList.remove "is-shown-statement"
    track('Statement', 'Closed')
    false

  getClipboardTextValue: ->
    @clipboardTextValue

module.exports = AppView
