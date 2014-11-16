ZeroClipboard.config( { swfPath: "bower_components/zeroclipboard/dist/ZeroClipboard.swf" } )

window.terms =
  "Trello": [
    "card"
    "board"
    "at a glance"
    "Trello"
    "Taco"
    "lists"
    "list of lists"
    "checklists"
    "Chorizo"
    "Pete"
    "Trello Gold"
    "Business Class"
    "visual"
    "free"
    "attachment"
    "drag and drop"
    "members"
    "organization"
  ]
  "Hodor": [
    "hodor"
    "hodor"
    "hodor"
    "hodor"
    "hodor"
    "hodor"
    "HODOR"
    "Hodor"
  ]
  "Escape": [
    "<p>"
    "<B>YESIR</B>"
    "<script>alert('good times')</script>"
    "</p>"
    "</html>"
    "Hey"
    "<img src='/' width='500' height='300'>"
  ]

window.templates =
  "ipsumText": "{{#paragraphs}}<p>{{.}}</p><br>{{/paragraphs}}"
  "ipsumJSON": "{{json}}"
  "optionType": "<li><a href='#' data-type='{{term}}'>{{term}}</a></li>"


class LoremModel extends Backbone.Model
  defaults: ->
    type: "Trello"
    paragraphs: 3
    format: "text"

  setType: (value) ->
    @set({type: value})

  setParagraphs: (value) ->
    @set({paragraphs: value})

  setFormat: (value) ->
    @set({format: value})


class LoremView extends Backbone.View

  initialize: ->
    @listenTo @model, "change", @renderIpsum
    @render()

  events:
    "click .js-select-type a": "selectType"
    "click .js-select-paragraphs a": "selectNumParagraphs"
    "click .js-select-format a": "selectFormat"
    "click .js-copy-to-clipbard": "copyToClipboard"

  render: ->
    @setElement $(".js-app") # :(

    @renderTypes()
    @renderNumParagraphs()
    @renderFormat()

    @renderIpsum()

    @clipboardClient = new ZeroClipboard(@$(".js-copy-to-clipboard"))

    @clipboardClient.on "error", (e) =>
      @$(".js-copy-to-clipboard").addClass("hidden")

    @clipboardClient.on "ready", (e) =>
      @$(".js-copy-to-clipboard").removeClass("hidden")

    @clipboardClient.on "aftercopy", (e) =>
      alert("Copied!")

    @

  renderTypes: ->
    $types = $(".js-list-types")
    template = templates.optionType
    $types.html (Mustache.render(template, {term}) for term of terms)
    @

  renderNumParagraphs: ->
    @

  renderFormat: ->
    @

  renderIpsum: ->
    $ipsum = $(".js-render-ipsum")
    format = @model.get("format")
    numParagraphs = @model.get("paragraphs")

    switch format

      when "html"
        paragraphs = for p in [1..numParagraphs]
          "<p>#{@generateParagraph()}</p>"
        $ipsum.html Mustache.render(templates.ipsumText, {paragraphs})

      when "json"
        paragraphs = for p in [1..numParagraphs]
          "\"#{@generateParagraph()}\""
        string = paragraphs.join(",")
        json = "[#{string}]"
        $ipsum.html Mustache.render(templates.ipsumJSON, {json})

      else # "Text", the default
        paragraphs = (@generateParagraph() for p in [1..numParagraphs])
        $ipsum.html Mustache.render(templates.ipsumText, {paragraphs})

    @

  generateSentence: ->
    # The sentence should be somehwere between 6 and 10 words or phrases
    lengthRange = [6..10]
    length = _.sample lengthRange
    type = @model.get("type")
    wordArray = _.sample terms[type], length
    rawSentence = wordArray.join(" ")
    # Uppercase first letter and add a period.
    sentence = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1) + "."

  generateParagraph: ->
    # The paragraph should be somehwere between 4 and 10 sentences.
    lengthRange = [4..10]
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


new LoremView({model: new LoremModel})
