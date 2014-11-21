templates =
  "ipsumText": "{{#paragraphs}}<p>{{.}}</p><br>{{/paragraphs}}"
  "ipsumJSON": "{{json}}"
  "optionType": "<li><a href='#' data-type='{{type}}' class='meta-control-options-item{{#isCurrent}} meta-control-options-item--is-current{{/isCurrent}}'>{{type}}</a></li>"
  "optionParagraphs": "<li><a href='#' data-paragraphs='{{num}}' class='meta-control-options-item{{#isCurrent}} meta-control-options-item--is-current{{/isCurrent}}'>{{num}}</a></li>"
  "optionFormat": "<li><a href='#' data-format='{{format}}' class='meta-control-options-item{{#isCurrent}} meta-control-options-item--is-current{{/isCurrent}}'>{{format}}</a></li>"

module.exports = templates
