# vendor
Clipboard = require 'clipboard'
{ render, p, raw, textarea, br, text, li, ul, a, span } = require 'teacup'

# utils
getRandomSubarray = require './utils/getRandomSubarray.coffee'
randomizedArrayCycler = require './utils/randomizedArrayCycler.coffee'
getRandomNumInRange = require './utils/getRandomNumInRange.coffee'
getElem = require './utils/getElem.coffee'
delegateClicks = require './utils/delegateClicks.coffee'

# analytics
track = require './analytics/track.coffee'

# data
flavors = require './data/flavors.coffee'
formats = require './data/formats.coffee'


class AppView
  constructor: (opts) ->
    @state = opts.state

    # http://stackoverflow.com/a/23522755
    @isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    @fLoadedStatement = false
    @clipboardTextValue = ''

    @state.on 'change', (key, value) =>
      switch key
        when 'flavor' then @renderFlavors()
        when 'format' then @renderFormats()
      @renderPlaceholder()

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
        return


      # Control + C stuff…

      # User hit control or command + C and copied the text. Let them know!
      if (e.ctrlKey || e.metaKey) && e.keyCode == 67
        @flashCopiedState()
        track('Copy', 'Cmd + C')
        return

      # If the user is already selecting something, stop here. Otherwise, we’ll
      # lose their focus with the new textarea.
      return if window.getSelection?()?.toString() ?
        document.selection?.createRange().text

      # Make a fake textarea with the clipboard text and focus it. It will soak
      # up the system's control + c shortcut.
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

  getClipboardTextValue: ->
    @clipboardTextValue

  getCustomWords: ->
    JSON.parse(localStorage.getItem('customwords')) ? []

  getFlavorWords: (flavor) ->
    defaultFlavor = @state.defaults.flavor

    if !flavor || !flavors[flavor]
      @state.set('flavor', defaultFlavor)
      return flavors[defaultFlavor]

    if flavor == "Custom"
      return @getCustomWords()

    flavors[flavor]

  render: ->
    @renderFlavors()
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
    selectedFlavor = @state.get("flavor")

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
            if flavor == "Custom"
              span '.meta-control-options-item-link-option.js-edit-custom', ->
                "✎"

    getElem('js-list-flavors').innerHTML = html
    delegateClicks('js-select-flavor', @selectFlavor.bind(@))

    getElem('js-edit-custom').addEventListener 'click', (e) =>
      e.preventDefault()
      @promptForCustomWords()

    @

  renderFormats: ->
    selectedFormat = @state.get("format")

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
    format = @state.get("format")

    numParagraphs = 8

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
          text "[#{paragraphs}]"

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
    flavor = @state.get('flavor')
    words = @getFlavorWords(flavor)
    cycler = randomizedArrayCycler(words)
    rawSentence = (cycler() for s in [0..length]).join(" ")
    # Uppercase first letter and add a period.
    sentence = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1) + "."

  generateParagraph: ->
    # The paragraph should be somehwere between 4 and 8 sentences.
    length = getRandomNumInRange(4,8)
    paragraph = (@generateSentence() for s in [0..length]).join(" ")

  promptForCustomWords: ->
    pr = prompt("Enter some words.")

    return if !pr
    return if pr.trim() == ""

    # truncate, strip punctuation, collapse whitespace, split on spaces
    trunct = pr.substring(0, 10000)
    punctless = trunct.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    collapsed = punctless.replace(/\s{2,}/g," ")
    wordArray = collapsed.split(" ")

    # save and render
    localStorage.setItem('customwords', JSON.stringify(wordArray))
    @state.set('flavor', "Custom")
    @renderPlaceholder()
    return

  selectFlavor: (e) ->
    e.preventDefault()
    value = e.target.getAttribute("data-flavor")
    return if !value

    # if they don't have any custom words yet, get some
    if value == "Custom" && @getCustomWords().length == 0
      @promptForCustomWords()

    @state.set('flavor', value)
    track('Select Flavor', value)
    false

  selectFormat: (e) ->
    e.preventDefault()
    value = e.target.getAttribute("data-format")
    @state.set('format', value)
    track('Select Format', value)
    false

  flashCopiedState: ->
    # TODO: clean up this disaster. Too much DOM manipulation and state.
    # Should add an idempotent renderCopyButton method.

    className = "js-copy-to-clipboard"
    if @isSafari
      className = "js-copy-cmd-c-text"

    copyBtn = getElem(className)

    if @copiedTimerId?
      clearTimeout @copiedTimerId
      copyBtn.classList.remove 'is-active'
      copyBtn.innerHTML = @originalCopyBtnHTML

    @originalCopyBtnHTML = copyBtn.innerHTML

    copyBtn.classList.add 'is-active'
    copyBtn.innerHTML = "Copied!"

    @copiedTimerId = setTimeout =>
      copyBtn.classList.remove 'is-active'
      copyBtn.innerHTML = @originalCopyBtnHTML
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

module.exports = AppView
